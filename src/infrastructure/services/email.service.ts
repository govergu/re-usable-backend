import { ENV } from "@config/env.js";
import { transporter } from "@config/mailer.js";

export const sendMail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: ENV.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
