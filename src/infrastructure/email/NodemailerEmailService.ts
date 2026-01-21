import nodemailer, { Transporter } from 'nodemailer';
import { config } from '@infrastructure/config/env';
import { TemplateRenderer } from './TemplateRenderer';
import type { IEmailService, SendEmailDTO } from '@application/ports/output/IEmailService';

export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;
  private renderer: TemplateRenderer;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true only for 465
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    this.renderer = new TemplateRenderer();
  }

  async send(dto: SendEmailDTO): Promise<void> {
    const html = this.renderer.render(dto.template, {
      ...dto.variables,
      subject: dto.subject,
      brandName: config.smtp.fromName,
      year: new Date().getFullYear(),
    });

    await this.transporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: dto.to,
      subject: dto.subject,
      html,
    });
  }
}
