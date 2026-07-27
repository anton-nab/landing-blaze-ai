"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/landing/Logo";
import { GoogleIcon } from "./GoogleIcon";
import posthog from "posthog-js";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "User already registered": "Un compte existe déjà avec cet email.",
  "Email not confirmed": "Confirmez votre email avant de vous connecter (vérifiez votre boîte de réception).",
  "Password should be at least 6 characters.": "Le mot de passe doit faire au moins 6 caractères.",
};

function translateError(message: string): string {
  return ERROR_MESSAGES[message] ?? message;
}

export function AuthForm({ mode, initialError }: { mode: "login" | "signup"; initialError?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (signUpError) return setError(translateError(signUpError.message));
      if (data.session) {
        posthog.identify(data.session.user.id);
        posthog.capture("signup_completed", { method: "email" });
        router.replace("/");
        router.refresh();
        return;
      }
      posthog.capture("signup_completed", { method: "email", email_confirmation_required: true });
      setNotice("Compte créé — vérifiez votre email pour confirmer votre inscription.");
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) return setError(translateError(signInError.message));
    if (signInData.session) {
      posthog.identify(signInData.session.user.id);
      posthog.capture("login_completed", { method: "email" });
    }
    router.replace("/");
    router.refresh();
  }

  async function onGoogle() {
    setError("");
    posthog.capture("google_auth_clicked", { mode });
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px] animate-fade-up">
        <Link href="/" className="mb-8 flex justify-center">
          <Wordmark />
        </Link>

        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-8">
          <h1 className="mb-1.5 text-center text-[20px] font-bold tracking-[-.02em] text-white">
            {isLogin ? "Content de vous revoir" : "Créer un compte"}
          </h1>
          <p className="mb-6 text-center text-[13px] text-muted-foreground">
            {isLogin
              ? "Connectez-vous pour retrouver vos audits."
              : "Débloquez l'historique et le suivi de vos scores."}
          </p>

          <button
            onClick={onGoogle}
            type="button"
            className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-[9px] border border-white/[.12] bg-white/5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-white/10"
          >
            <GoogleIcon className="h-4 w-4" />
            Continuer avec Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[.08]" />
            <span className="text-[11.5px] text-[#4E5270]">ou</span>
            <div className="h-px flex-1 bg-white/[.08]" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-[#C7CBE8]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-[9px] border border-white/[.1] bg-white/[.03] px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-[#4E5270] focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-[#C7CBE8]">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[9px] border border-white/[.1] bg-white/[.03] px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-[#4E5270] focus:border-brand"
              />
            </div>

            {error ? <div className="text-[13px] text-danger">{error}</div> : null}
            {notice ? <div className="text-[13px] text-success">{notice}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-1.5 flex items-center justify-center gap-2 rounded-[9px] bg-brand py-2.5 text-[13.5px] font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLogin ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="font-semibold text-white hover:underline">
                S&apos;inscrire
              </Link>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <Link href="/connexion" className="font-semibold text-white hover:underline">
                Se connecter
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
