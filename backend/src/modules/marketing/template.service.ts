import { getAdminClient } from '../../config/supabase.js';

export class TemplateService {
  /**
   * Replace placeholders like {{customer_name}} with actual values
   */
  static interpolate(templateStr: string, variables: Record<string, any>): string {
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
  async createEmailTemplate(payload: any) {
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
   * Create a push template
   */
  async createPushTemplate(payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('push_templates')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
