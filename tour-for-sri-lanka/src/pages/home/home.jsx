import HeroSection from "./HeroSection";
import CategorySection from "./CategorySection";
import Footer from "../../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-primary-1)]">
      <HeroSection />
      <CategorySection />
      <Footer />
    </div>
  );
};

export default HomePage;