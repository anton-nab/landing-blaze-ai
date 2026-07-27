const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function emailShell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="background:#0A0B12;border-radius:16px;padding:36px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:24px;height:24px;border-radius:7px;background:#5B6EE8;font-size:0;line-height:0;">&nbsp;</td>
              <td style="padding-left:10px;color:#ffffff;font-size:16px;font-weight:700;">LandingBlaze</td>
            </tr>
          </table>
          <div style="height:28px;"></div>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 8px 0;text-align:center;color:#9599C0;font-size:12px;">
          LandingBlaze — Audit de landing page par IA
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#5B6EE8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:9px;">${label}</a>`;
}

export function welcomeEmail(): { subject: string; html: string } {
  return {
    subject: "Bienvenue sur LandingBlaze 🔥",
    html: emailShell(`
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 12px;">Bienvenue à bord.</h1>
      <p style="color:#C7CBE8;font-size:14.5px;line-height:1.6;margin:0 0 24px;">
        Votre compte est prêt. Collez l'URL d'une landing page et l'IA vous dira en 30 secondes
        ce qui bloque vraiment la conversion — headline, CTA, copywriting, UX, et le reste.
      </p>
      ${button("Auditer une page →", SITE_URL)}
    `),
  };
}

export function reportReadyEmail(input: { url: string; score: number; reportUrl: string }): {
  subject: string;
  html: string;
} {
  let hostname = input.url;
  try {
    hostname = new URL(input.url).hostname;
  } catch {
    // keep raw url as fallback
  }

  return {
    subject: `Votre audit de ${hostname} est prêt — ${input.score}/100`,
    html: emailShell(`
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 12px;">Votre audit est prêt.</h1>
      <p style="color:#C7CBE8;font-size:14.5px;line-height:1.6;margin:0 0 4px;">
        <span style="font-family:ui-monospace,monospace;color:#9599C0;">${hostname}</span>
      </p>
      <div style="font-family:ui-monospace,monospace;color:#ffffff;font-size:40px;font-weight:600;margin:8px 0 20px;">
        ${input.score}<span style="color:#71717A;font-size:16px;"> / 100</span>
      </div>
      ${button("Voir le rapport complet →", input.reportUrl)}
    `),
  };
}
