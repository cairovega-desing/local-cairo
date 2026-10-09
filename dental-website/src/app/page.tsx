import About from "@/components/About";
import Cases from "@/components/Cases";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Location from "@/components/Location";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import { ScrollProgress } from "@/components/ScrollProgress";
import Testimonials from "@/components/Testimonials";
import Treatments from "@/components/Treatments";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ui } from "@/data/content";

export default function Home() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-full bg-primary-deep px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {ui.skipToContent}
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="contenido">
        <Hero />
        <Marquee />
        <About />
        <Treatments />
        <Cases />
        <Testimonials />
        <Gallery />
        <Experience />
        <FAQ />
        <Location />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
