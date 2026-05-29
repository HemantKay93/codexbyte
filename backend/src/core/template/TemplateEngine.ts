import logger from '../../services/logger.js';

export class TemplateEngine {
  /**
   * Renders a template string by replacing {{variable}} with values from context
   * @param template - The raw template string
   * @param context - Key-value pairs for substitution
   * @returns The rendered string
   */
  static render(template: string, context: Record<string, any>): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!template) return '';
    if (!context) return template;

    try {
      // Regex to match {{ variable_name }} or {{variable_name}}
      return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
        // Resolve nested keys e.g. {{ user.name }}
        const value = this.resolveKey(key, context);
        return value !== undefined && value !== null ? String(value) : '';
      }); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error('[TemplateEngine] Error rendering template:', err);
      return template;
    }
  }

  /**
   * Evaluates a dot-notated key against a context object // eslint-disable-line @typescript-eslint/no-explicit-any
   */
  private static resolveKey(key: string, context: any): any {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return key
      .split('.')
      .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), context);
  }
}
