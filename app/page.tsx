import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Why } from "@/components/landing/Why";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Why />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
    </>
  );
}
