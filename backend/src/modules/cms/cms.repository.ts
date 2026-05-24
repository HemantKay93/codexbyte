import { getAdminClient } from '../../config/supabase.js';

export class CmsRepository {
  /**
   * IMPORTANT: We always use getAdminClient() (service role key) for BOTH reads
   * and writes so that Row Level Security never silently blocks or filters data.
   * The anon client (supabase) is subject to RLS which caused whatsapp_config and
   * other settings rows saved via admin to be invisible on the next read.
   */
  async findBySlug(pageSlug: string, sectionKeys?: string[]) {
    const admin = await getAdminClient();

    let query = admin
      .from('cms_content')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('updated_at', { ascending: false }); // Newest first

    if (sectionKeys && sectionKeys.length > 0) {
      query = query.in('section_key', sectionKeys);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`[CMS] findBySlug ERROR for ${pageSlug}:`, error);
      throw error;
    }

    // Deduplicate — always keep the newest row per section_key
    const deduplicated: any[] = [];
    const seen = new Set<string>();
    for (const row of data || []) {
      if (!seen.has(row.section_key)) {
        seen.add(row.section_key);
        deduplicated.push(row);
      }
    }

    return deduplicated;
  }

  async upsert(pageSlug: string, sectionKey: string, content: any) {
    const admin = await getAdminClient();
    console.log(`[CMS] Upserting ${pageSlug}:${sectionKey}...`);

    const { data, error } = await admin
      .from('cms_content')
      .upsert(
        {
          page_slug: pageSlug,
          section_key: sectionKey,
          content,
          updated_at: new Date().toISOString(),
          is_published: true,
        },
        { onConflict: 'page_slug,section_key' }
      )
      .select();

    if (error) {
      console.error(`[CMS] Upsert ERROR for ${pageSlug}:${sectionKey}:`, error);
      throw error;
    }

    console.log(
      `[CMS] Upsert SUCCESS for ${pageSlug}:${sectionKey}. Rows returned: ${data?.length}`
    );
    return data ? data[0] : null;
  }

  async upsertBulk(pageSlug: string, sections: { sectionKey: string; content: any }[]) {
    if (!sections || sections.length === 0) {
      console.warn(`[CMS] upsertBulk called with NO sections for page: ${pageSlug}`);
      return [];
    }
    const results = await Promise.all(
      sections.map((s) => this.upsert(pageSlug, s.sectionKey, s.content))
    );
    return results;
  }
}
