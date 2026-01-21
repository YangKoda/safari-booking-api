import nodemailer, { Transporter } from 'nodemailer';
import { config } from '@infrastructure/config/env';
import { TemplateRenderer } from './TemplateRenderer';
import type { IEmailService, SendEmailDTO } from '@application/ports/output/IEmailService';
import Logger from '@shared/utils/logger';


export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter | null;
  private renderer: TemplateRenderer;

  constructor() {
    this.renderer = new TemplateRenderer();
    // If email disabled, do not configure SMTP at all
    if (!config.email.enabled) {
      this.transporter = null;
      Logger.info('Email service disabled (EMAIL_ENABLED=false)');
      return;
    }
    if (!config.smtp) {
      throw new Error('SMTP config missing while EMAIL_ENABLED=true');
    }
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true only for 465
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      // Prevent hanging forever in production
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    this.renderer = new TemplateRenderer();

    // Verify SMTP config early
    this.transporter.verify((err) => {
      if (err) {
        Logger.error(`SMTP verification failed: ${err.message}`);
      } else {
        Logger.info('SMTP connection verified successfully');
      }
    });
  }

  async send(dto: SendEmailDTO): Promise<void> {
    //  Best practice: silently ignore if email is disabled
    if (!config.email.enabled) return;
    if (!this.transporter || !config.smtp) {
      throw new Error('Email transporter not initialized');
    }
    try {
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
      Logger.info(`Email sent → ${dto.to} (${dto.template})`);
    } catch (error: any) {
      Logger.error(`Email failed → ${dto.to} (${dto.template}): ${error.message}`);
      throw error;
    }
  }
}
