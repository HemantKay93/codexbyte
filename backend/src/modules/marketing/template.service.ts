import { getAdminClient } from '../../config/supabase.js';

export class TemplateService {
  /**
   * Replace placeholders like {{customer_name}} with actual values
   */
  static interpolate(templateStr: string, variables: Record<string, any>): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!templateStr) return '';
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  /**
   * Get all email templates
   */
  async getEmailTemplates() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all push templates
   */
  async getPushTemplates() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('push_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create an email template
   */
  // eslint-disable-line @typescript-eslint/no-explicit-any
  async createEmailTemplate(payload: Record<string, any>) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('email_templates')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an email template
   */
  async updateEmailTemplate(id: string, payload: Record<string, any>) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('email_templates')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a push template
 // eslint-disable-line @typescript-eslint/no-explicit-any
   */
  async createPushTemplate(payload: Record<string, any>) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('push_templates')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a push template
   */
  async updatePushTemplate(id: string, payload: Record<string, any>) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('push_templates')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
