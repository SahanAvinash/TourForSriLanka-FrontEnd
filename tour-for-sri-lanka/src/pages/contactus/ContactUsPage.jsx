import { useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ContactHeroSection from "./ContactHeroSection";
import ContactInfo from "./ContactInfo";
import FAQSection from "./FAQSection";
import OfficeLocation from "./OfficeLocation";

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

export default function ContactUsPage() {
  const [infoRef, infoInView] = useInView()
  const [officeRef, officeInView] = useInView()
  const [faqRef, faqInView] = useInView()

  return (
    <div className="bg-[#11212D] min-h-screen pt-20">
        <Navbar/>

        <div className="contact-hero-anim">
          <ContactHeroSection />
        </div>

        <div ref={infoRef} className={`contact-info-anim ${infoInView ? "in-view" : ""}`}>
          <ContactInfo />
        </div>

        <div ref={officeRef} className={`office-location-anim ${officeInView ? "in-view" : ""}`}>
          <OfficeLocation />
        </div>

        <div ref={faqRef} className={`faq-section-anim ${faqInView ? "in-view" : ""}`}>
          <FAQSection />
        </div>

        <Footer/>
    </div>
  );
}