import { PageSeo } from '@/components/seo/PageSeo';
import { AboutSection } from '@/features/home/components/AboutSection';
import { CTASection } from '@/features/home/components/CTASection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { ServicesSection } from '@/features/home/components/ServicesSection';
import { TestimonialsSection } from '@/features/home/components/TestimonialsSection';

export function HomePage() {
  return (
    <>
      <PageSeo
        title="ByteeVolvr | IT Consulting & Technology Trading"
        description="ByteeVolvr Enterprises delivers IT consulting, repair services, AMC contracts, technology trading, and B2B supply across India."
      />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
