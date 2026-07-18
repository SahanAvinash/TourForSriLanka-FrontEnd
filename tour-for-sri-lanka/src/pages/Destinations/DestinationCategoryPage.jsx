import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DestinationGrid from "../../components/destination/DestinationGrid";
import Footer from "../../components/Footer";

const titles = {
  beaches: "Relaxing Beaches",
  ancient: "Ancient Cities",
  mountains: "Mountain Escapes",
  cities: "City Life",
  villages: "Village Experience",
  wildlife: "Wildlife Safari",
};
const descriptions = {
  beaches: 
    "Escape to the calming embrace of pristine beaches where time slows down, and worries fade away. Feel the warmth of the golden sun as it kisses your skin, listen to the soothing sound of waves gently crashing on the shore, and sink your feet into soft, powdery sand. Whether you seek a peaceful retreat under swaying palm trees or a leisurely swim in crystal-clear waters, our beach destinations promise a haven of tranquility. Perfect for unwinding with loved ones or enjoying a moment of solitude, these serene locations offer stunning sunsets, refreshing sea breezes, and the ultimate relaxation experience.",
  ancient:
    "Journey into the heart of history with a visit to mesmerizing Ancient Cities. These destinations transport you to a bygone era, where cobblestone streets, majestic temples, and awe-inspiring ruins whisper tales of the past. Wander through ancient marketplaces, admire intricate architecture, and marvel at landmarks that have stood the test of time. Perfect for culture enthusiasts and history buffs, these cities offer a unique glimpse into the civilizations that shaped humanity. Whether it’s unraveling the mysteries of ancient cultures or simply enjoying the timeless charm of historical sites, Ancient Cities invite you to step back in time and create unforgettable memories."
}

const DestinationCategoryPage = () => {

  const { category } = useParams();

  return (
    <div className="min-h-screen bg-[#11212D]">
      <Navbar/>
      <section className="pt-28 text-center">
        <h1 className="text-white text-5xl font-bold">
          {titles[category]}
        </h1>
        <p className="text-gray-400 mt-5 text-lg pl-[50px] pr-[50px]">
          {descriptions[category] || "Explore beautiful destinations across Sri Lanka."}
        </p>
      </section>

      <DestinationGrid />
    <Footer/>
    </div>
  );
};

export default DestinationCategoryPage;