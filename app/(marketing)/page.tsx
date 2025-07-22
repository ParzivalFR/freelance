import AboutSection from "@/components/landing/about-section";
import ContactFormImproved from "@/components/landing/contact-form-improved";
import CallToActionSection from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/Testimonials";
import { CircleLight } from "@/components/magicui/circle-light";
import { FeatureSectionDB } from "@/components/magicui/Features-db";
import Particles from "@/components/magicui/particles";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <Testimonials />
      <FeatureSectionDB />
      <PricingSection />
      <CircleLight />
      <CallToActionSection />
      <FAQ />
      <AboutSection />
      <CircleLight />
      <ContactFormImproved />
      <Particles
        className="absolute inset-0 -z-10"
        quantity={150}
        ease={70}
        size={0.05}
        staticity={40}
        color="#999999"
      />
    </>
  );
}
