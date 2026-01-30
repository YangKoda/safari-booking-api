export interface SendEmailDTO {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

export interface IEmailService {
  send(dto: SendEmailDTO): Promise<void>;
}
