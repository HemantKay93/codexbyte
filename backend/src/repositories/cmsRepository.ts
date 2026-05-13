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
    const { data, error } = await admin
      .from('cms_content')
      .upsert(
        {
          page_slug: pageSlug,
          section_key: sectionKey,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug,section_key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsertBulk(pageSlug: string, sections: { sectionKey: string; content: any }[]) {
    const admin = await getAdminClient();
    const rows = sections.map((s) => ({
      page_slug: pageSlug,
      section_key: s.sectionKey,
      content: s.content,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await admin
      .from('cms_content')
      .upsert(rows, { onConflict: 'page_slug,section_key' })
      .select();

    if (error) throw error;
    return data;
  }
}
