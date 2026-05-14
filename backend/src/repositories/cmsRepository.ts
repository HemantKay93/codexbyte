import { supabase, getAdminClient } from '../config/supabase.js';

export class CmsRepository {
  async findBySlug(pageSlug: string, sectionKeys?: string[]) {
    let query = supabase.from('cms_content').select('*').eq('page_slug', pageSlug);

    if (sectionKeys && sectionKeys.length > 0) {
      query = query.in('section_key', sectionKeys);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
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
    const results = await Promise.all(
      sections.map((s) => this.upsert(pageSlug, s.sectionKey, s.content))
    );
    return results;
  }
}
