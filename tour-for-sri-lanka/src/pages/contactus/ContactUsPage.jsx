import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ContactHeroSection from "./ContactHeroSection";
import ContactInfo from "./ContactInfo";
import FAQSection from "./FAQSection";
import OfficeLocation from "./OfficeLocation";

export default function ContactUsPage() {
  return (
    <div className="bg-[#11212D] min-h-screen pt-20">
        <Navbar/>
        <ContactHeroSection />
        <ContactInfo />
        <OfficeLocation />
        <FAQSection />
        <Footer/>
    </div>
  );
}