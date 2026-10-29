import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { ScrollProgress } from "@/components/ScrollProgress";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { Reviews } from "@/components/sections/Reviews";
import { ServiceMarquee } from "@/components/sections/ServiceMarquee";
import { Services } from "@/components/sections/Services";
import { site } from "@/content/site";

export default function Home() {
  return (
    <MotionProvider>
      <a
        href="#contenido"
        className="fixed top-3 left-3 z-[70] -translate-y-24 rounded-full bg-ink px-5 py-3 font-bold text-surface transition-transform focus:translate-y-0"
      >
        {site.a11y.saltar}
      </a>
      <ScrollProgress />
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <ServiceMarquee />
        <Experience />
        <About />
        <Services />
        <Portfolio />
        <Reviews />
        <Gallery />
        <Process />
        <Faq />
        <Location />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </MotionProvider>
  );
}
