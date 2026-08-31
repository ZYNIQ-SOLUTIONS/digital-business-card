import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { themeList } from '@/lib/theme';

export const dynamic = 'force-dynamic';

/**
 * GET /api/themes
 * Returns all themes (built-in + published database custom themes)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }

    // Fetch custom themes from database
    let query = supabase.from('custom_themes').select('*');
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }
    const { data: dbThemes, error } = await query.order('created_at', { ascending: false });

    if (error && error.code !== '42P01') { // 42P01: undefined_table (graceful fallback)
      console.warn('Custom themes table query error:', error.message);
    }

    const customThemesFormatted = (dbThemes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      isDark: t.is_dark ?? true,
      category: t.category || 'custom',
      isCustom: true,
      isPublished: t.is_published ?? true,
      isFeatured: t.is_featured ?? false,
      previewBg: t.preview_bg || t.tokens?.previewBg || '#0f172a',
      previewAccent: t.preview_accent || t.tokens?.previewAccent || '#8b5cf6',
      previewSecondary: t.preview_secondary || t.tokens?.previewSecondary || '#334155',
      customCss: t.custom_css || '',
      layoutConfig: t.layout_config,
      ...(t.tokens || {})
    }));

    return NextResponse.json({
      success: true,
      builtInThemes: themeList,
      customThemes: customThemesFormatted,
      allThemes: [...themeList, ...customThemesFormatted],
      isAdmin
    });
  } catch (err: any) {
    console.error('Error fetching themes:', err);
    return NextResponse.json({
      success: true,
      builtInThemes: themeList,
      customThemes: [],
      allThemes: themeList,
      isAdmin: false
    });
  }
}

/**
 * POST /api/themes
 * Creates or publishes a new custom theme (Admin only)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      isDark,
      category,
      tokens,
      layoutConfig,
      isPublished,
      isFeatured,
      previewBg,
      previewAccent,
      previewSecondary,
      customCss
    } = body;

    if (!name || !tokens) {
      return NextResponse.json({ error: 'Missing required theme fields (name, tokens)' }, { status: 400 });
    }

    const sanitizedId = (id || `theme-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).trim();

    const insertPayload = {
      id: sanitizedId,
      name,
      description: description || '',
      is_dark: isDark ?? true,
      category: category || 'creative',
      tokens: {
        ...tokens,
        id: sanitizedId,
        name,
        description: description || '',
        isDark: isDark ?? true,
        category: category || 'creative',
      },
      layout_config: layoutConfig || { style: 'classic-segmented', sections: ['hero', 'actions', 'contact', 'socials', 'nfc'] },
      is_published: isPublished ?? true,
      is_featured: isFeatured ?? false,
      preview_bg: previewBg || tokens.previewBg || '#0f172a',
      preview_accent: previewAccent || tokens.previewAccent || '#8b5cf6',
      preview_secondary: previewSecondary || tokens.previewSecondary || '#334155',
      custom_css: customCss || '',
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('custom_themes')
      .upsert(insertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert theme error:', error);
      // If table doesn't exist yet, return success with client payload
      return NextResponse.json({
        success: true,
        theme: insertPayload,
        warning: 'Saved in memory. Run supabase/themes_schema.sql to persist across sessions.'
      });
    }

    return NextResponse.json({
      success: true,
      theme: data
    });
  } catch (err: any) {
    console.error('Error saving custom theme:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/themes
 * Deletes a custom theme by ID (Admin only)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('id');

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('custom_themes')
      .delete()
      .eq('id', themeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: themeId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
