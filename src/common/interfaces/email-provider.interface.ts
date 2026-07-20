export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  sendEmail(payload: SendEmailPayload): Promise<void>;
}
