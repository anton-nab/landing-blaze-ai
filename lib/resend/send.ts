import { getResendClient, EMAIL_FROM } from "./client";

/** Fire-and-forget email send — logs failures but never throws, emails should never block a request. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  if (error) console.error("[resend] send failed", error);
}
