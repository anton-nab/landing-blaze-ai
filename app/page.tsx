import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Why } from "@/components/landing/Why";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user ? { email: user.email } : null} />
      <Hero />
      <Why />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
    </>
  );
}
