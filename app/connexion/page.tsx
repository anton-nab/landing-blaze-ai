import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Connexion — LandingBlaze" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error === "auth" ? "La connexion a échoué. Réessayez." : undefined;

  return <AuthForm mode="login" initialError={initialError} />;
}
