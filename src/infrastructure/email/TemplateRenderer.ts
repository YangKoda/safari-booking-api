import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';

export class TemplateRenderer {
  private templatesRoot: string;

  constructor(templatesRoot?: string) {
    // Default = src/infrastructure/email/templates
    this.templatesRoot =
      templatesRoot || path.join(process.cwd(), 'src', 'infrastructure', 'email', 'templates');
  }

  render(templateName: string, variables: Record<string, any>): string {
    const layoutPath = path.join(this.templatesRoot, 'layouts', 'base.hbs');
    const templatePath = path.join(this.templatesRoot, `${templateName}.hbs`);

    if (!fs.existsSync(layoutPath)) {
      throw new Error(`Email layout not found: ${layoutPath}`);
    }
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    const layoutSource = fs.readFileSync(layoutPath, 'utf8');
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    // Compile inner body first
    const body = Handlebars.compile(templateSource)(variables);

    // Then compile layout with subject/body vars
    const html = Handlebars.compile(layoutSource)({
      ...variables,
      body,
    });

    return html;
  }
}
