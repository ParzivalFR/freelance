import AboutSection from "@/components/landing/about-section";
import BotBuilderPreview from "@/components/landing/bot-builder-preview";
import BotPricingSection from "@/components/landing/bot-pricing-section";
import ContactFormImproved from "@/components/landing/contact-form-improved";
import CallToActionSection from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/Testimonials";
import { FeatureSectionDB } from "@/components/magicui/Features-db";
import { CircleLight } from "@/components/magicui/circle-light";
import Particles from "@/components/magicui/particles";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <Testimonials />
      <FeatureSectionDB />
      <PricingSection />
      <BotBuilderPreview />
      <BotPricingSection />
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
