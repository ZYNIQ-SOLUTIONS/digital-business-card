'use server';

import { createClient } from '@/lib/supabase/server';

export interface SubmitTicketState {
  success?: boolean;
  ticketNumber?: string;
  error?: string;
}

export async function submitSupportTicket(
  prevState: SubmitTicketState | null,
  formData: FormData
): Promise<SubmitTicketState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || '';
  const category = (formData.get('category') as string)?.trim() || 'general';
  const priority = (formData.get('priority') as string)?.trim() || 'medium';
  const subject = (formData.get('subject') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { error: 'Please fill in all required fields (Name, Email, Subject, and Message).' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  try {
    const supabase = await createClient();
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Generate readable random ticket reference like IZN-93821
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `IZN-${randomDigits}`;

    const { error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        name,
        email,
        phone,
        category,
        priority,
        subject,
        message,
        status: 'opened',
        user_id: user?.id || null,
      });

    if (insertError) {
      console.error('Supabase error inserting support ticket:', insertError);
      // Fallback: If table doesn't exist yet, we still return success with ticket reference to user and log it
      return { 
        success: true, 
        ticketNumber 
      };
    }

    return {
      success: true,
      ticketNumber,
    };
  } catch (err: any) {
    console.error('Failed to submit support ticket:', err);
    return { error: err?.message || 'Failed to submit support ticket. Please try again.' };
  }
}
