import {
  IEmailProvider,
  SendEmailPayload,
} from "@common/interfaces/email-provider.interface.js";
import { sendMail } from "@infrastructure/services/email.service.js";
import { retryWithBackoff } from "@common/utils/emailRetry.js";

export class ResilientNodemailerProvider implements IEmailProvider {
  async sendEmail(payload: SendEmailPayload): Promise<void> {
    await retryWithBackoff(
      () => sendMail(payload.to, payload.subject, payload.html),
      { retries: 3, delay: 1000 },
    );
  }
}
