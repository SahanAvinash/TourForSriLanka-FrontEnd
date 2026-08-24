import GuideHeroSection from "./GuideHeroSection";
import YourGuideBookings from "./YourGuideBookings";
import GuideList from "./GuideList";
import { useRef, useState } from "react";
import Footer from "../../components/Footer";

const GuidePage = () => {
  const [filters, setFilters] = useState(null);
  const guideResultsRef = useRef(null);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    setTimeout(() => {
      guideResultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-[#11212D] text-white">
      <GuideHeroSection onFilterChange={handleFilterChange} />

      <YourGuideBookings />

      <section ref={guideResultsRef} className="scroll-mt-24">
        <GuideList filters={filters} />
      </section>

      <Footer />
    </main>
  );
};

export default GuidePage;