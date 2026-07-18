import HeroSection from "../../components/Home/HeroSection";
import CategorySection  from "../../components/Home/CategorySection";
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