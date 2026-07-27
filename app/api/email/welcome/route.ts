import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { sendEmail } from "@/lib/resend/send";
import { welcomeEmail } from "@/lib/resend/templates";

// Called client-side right after a successful signup (see AuthForm.tsx) --
// Supabase itself handles the auth confirmation email, this is purely our
// own branded welcome message. Best-effort: never blocks the signup flow.
export async function POST() {
  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ sent: false }, { status: 200 });
  }

  const { subject, html } = welcomeEmail();
  await sendEmail(user.email, subject, html);

  return NextResponse.json({ sent: true });
}
