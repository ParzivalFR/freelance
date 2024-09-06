import ContactForm from "@/components/landing/contact-form";
import CallToActionSection from "@/components/landing/cta-section";
import { FAQ } from "@/components/landing/faq-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import { CircleLight } from "@/components/magicui/circle-light";
import { FeatureSection } from "@/components/magicui/Features";
import dynamic from "next/dynamic";

const DynamicTestimonials = dynamic(
  () =>
    import("@/components/landing/Testimonials").then((mod) => mod.Testimonials),
  { ssr: false }
);

const DynamicParticles = dynamic(
  () => import("@/components/magicui/particles"),
  { ssr: false }
);

const DynamicContactForm = dynamic(
  () => import("@/components/landing/contact-form"),
  { ssr: false }
);

export default async function Page() {
  return (
    <>
      <HeroSection />
      <DynamicTestimonials />
      <FeatureSection />
      <PricingSection />
      <CircleLight />
      <CallToActionSection />
      <FAQ />
      <CircleLight />
      <DynamicContactForm />
      <DynamicParticles
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
