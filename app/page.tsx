import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Why } from "@/components/landing/Why";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { createClient } from "@/lib/supabase/server-client";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav user={user ? { email: user.email ?? "" } : null} />
      <Hero />
      <Why />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
    </>
  );
}
