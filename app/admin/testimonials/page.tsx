import { createClient, createAdminClient } from '@/lib/supabase/server';
import { CURATED_ROW_1, CURATED_ROW_2 } from '@/components/testimonials-marquee';
import { TestimonialsManager } from './testimonials-manager';

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  let adminClient: any = null;
  try {
    adminClient = createAdminClient();
  } catch {}

  const client = adminClient || (await createClient());

  let dbTestimonials: any[] = [];
  try {
    const { data, error } = await client
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbTestimonials = data;
    }
  } catch (err) {
    console.warn("Could not query testimonials from DB:", err);
  }

  // Also pass curated defaults for context
  const curatedList = [...CURATED_ROW_1, ...CURATED_ROW_2];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Landing Page Testimonials
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review community feedback and choose which shoutouts appear on the landing page ticker.
          </p>
        </div>
      </div>

      <TestimonialsManager 
        initialDbTestimonials={dbTestimonials} 
        curatedTestimonials={curatedList} 
      />
    </div>
  );
}
