import logger from '../../services/logger.js';

export class TemplateEngine {
  /**
   * Renders a template string by replacing {{variable}} with values from context
   * @param template - The raw template string
   * @param context - Key-value pairs for substitution
   * @returns The rendered string
   */
  static render(template: string, context: Record<string, any>): string {
    if (!template) return '';
    if (!context) return template;

    try {
      // Regex to match {{ variable_name }} or {{variable_name}}
      return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
        // Resolve nested keys e.g. {{ user.name }}
        const value = this.resolveKey(key, context);
        return value !== undefined && value !== null ? String(value) : '';
      });
    } catch (err: any) {
      logger.error('[TemplateEngine] Error rendering template:', err);
      return template;
    }
  }

  /**
   * Evaluates a dot-notated key against a context object
   */
  private static resolveKey(key: string, context: any): any {
    return key
      .split('.')
      .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), context);
  }
}
