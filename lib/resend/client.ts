import { Resend } from "resend";

let cachedClient: Resend | null | undefined;

/** Returns null (not throws) when unconfigured — emails are a nice-to-have, never block the caller. */
export function getResendClient(): Resend | null {
  if (cachedClient !== undefined) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

// onboarding@resend.dev works without a verified domain, but Resend only
// allows sending to the account's own email address until a domain is
// verified. Swap to a real "audits@landingblaze.ai"-style address once one
// is verified (see Resend dashboard > Domains).
export const EMAIL_FROM = "LandingBlaze <onboarding@resend.dev>";
