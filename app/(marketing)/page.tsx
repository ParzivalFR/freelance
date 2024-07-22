import ContactForm from "@/components/landing/contact-form";
import CallToActionSection from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/reviews";
import { CircleLight } from "@/components/magicui/circle-light";
import Particles from "@/components/magicui/particles";

export default async function Page() {
  return (
    <>
      <HeroSection />
      {/* <SocialProofTestimonials /> */}
      <Testimonials />
      <PricingSection />
      <CircleLight />
      <CallToActionSection />
      <FAQ />
      <CircleLight />
      <ContactForm />
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
