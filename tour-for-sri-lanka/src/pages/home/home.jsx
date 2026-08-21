import HeroSection from "./HeroSection";
import CategorySection  from "./CategorySection";
import Footer from "../../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#11212D]">
      <HeroSection />
      <CategorySection />
      <Footer/>
    </div>
  );
};

export default HomePage;