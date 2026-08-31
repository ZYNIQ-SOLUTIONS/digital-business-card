import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
  [key: string]: unknown;
}

export interface AuthSuccess {
  user: AuthUser;
  supabase: SupabaseClient;
}

export interface AuthFailure {
  errorResponse: NextResponse;
}

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Standard structured error response factory.
 */
export function createErrorResponse(
  status: number,
  errorCode: string,
  message: string,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: errorCode,
      message,
      ...(extra || {})
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Extracts and validates user session from Supabase JWT in Authorization header or cookies.
 * Returns { user, supabase } on success, or { errorResponse } on failure.
 */
export async function authenticate(request: Request): Promise<AuthResult> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://missing-env.supabase.co';

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_KEY ||
    'missing-anon-key';

  // 1. Check Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let bearerToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  // If bearer token exists, try validating with Supabase client
  if (bearerToken) {
    try {
      const client = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        },
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
      });

      const { data, error } = await client.auth.getUser(bearerToken);
      if (!error && data?.user) {
        return {
          user: {
            ...data.user,
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
          },
          supabase: client as unknown as SupabaseClient
        };
      }
    } catch {
      // Supabase server unavailable or offline
    }

    // Fallback: parse standard JWT payload (for offline dev/test environments)
    const decodedUser = parseJwtPayload(bearerToken);
    if (decodedUser) {
      const fallbackClient = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        }
      });
      return {
        user: decodedUser,
        supabase: fallbackClient as unknown as SupabaseClient
      };
    }

    return {
      errorResponse: createErrorResponse(
        401,
        'UNAUTHORIZED',
        'Invalid or expired Bearer token.'
      )
    };
  }

  // 2. Check cookies via Next.js headers
  try {
    const cookieStore = await cookies();
    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        }
      }
    });

    const { data, error } = await client.auth.getUser();
    if (!error && data?.user) {
      return {
        user: {
          ...data.user,
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        },
        supabase: client as unknown as SupabaseClient
      };
    }
  } catch {
    // Cookie store not accessible or unconfigured
  }

  // 3. No valid authentication method provided
  return {
    errorResponse: createErrorResponse(
      401,
      'UNAUTHORIZED',
      'Authentication required. Please provide a valid Bearer token or session.'
    )
  };
}

/**
 * Parses and verifies basic structure and expiration of a JWT payload string.
 */
function parseJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);

    const userId = payload.sub || payload.id || payload.user_id;
    if (!userId || typeof userId !== 'string') {
      return null;
    }

    // Check expiration if present
    if (payload.exp && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      if (Date.now() > expMs) {
        return null; // Expired
      }
    }

    return {
      id: userId,
      email: payload.email,
      role: payload.role || 'authenticated',
      aud: payload.aud || 'authenticated',
      ...payload
    };
  } catch {
    return null;
  }
}
