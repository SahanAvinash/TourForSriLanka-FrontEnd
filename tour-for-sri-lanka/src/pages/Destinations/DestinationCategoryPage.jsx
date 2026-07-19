import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DestinationGrid from "../../components/destination/DestinationGrid";
import Footer from "../../components/Footer";

const titles = {
  beaches: "Relaxing Beaches",
  ancient: "Ancient Cities",
  mountains: "Edges of Mountains",
  cities: "City Vibes",
  villages: "Village Experience",
  wildlife: "Wildlife Safari",
};
const descriptions = {
  beaches: 
    "Escape to the calming embrace of pristine beaches where time slows down, and worries fade away. Feel the warmth of the golden sun as it kisses your skin, listen to the soothing sound of waves gently crashing on the shore, and sink your feet into soft, powdery sand. Whether you seek a peaceful retreat under swaying palm trees or a leisurely swim in crystal-clear waters, our beach destinations promise a haven of tranquility. Perfect for unwinding with loved ones or enjoying a moment of solitude, these serene locations offer stunning sunsets, refreshing sea breezes, and the ultimate relaxation experience.",
  ancient:
    "Journey into the heart of history with a visit to mesmerizing Ancient Cities. These destinations transport you to a bygone era, where cobblestone streets, majestic temples, and awe-inspiring ruins whisper tales of the past. Wander through ancient marketplaces, admire intricate architecture, and marvel at landmarks that have stood the test of time. Perfect for culture enthusiasts and history buffs, these cities offer a unique glimpse into the civilizations that shaped humanity. Whether it’s unraveling the mysteries of ancient cultures or simply enjoying the timeless charm of historical sites, Ancient Cities invite you to step back in time and create unforgettable memories.",
  mountains:
    "Explore the untamed beauty of the Edges of the Mountain, where breathtaking landscapes meet thrilling adventures. Perfect for those who crave nature and tranquility, this destination offers a mix of rugged cliffs, lush greenery, and panoramic views that captivate the soul. Take on exhilarating hikes to summit peaks, discover cascading waterfalls hidden among the trees, or enjoy a peaceful moment in the crisp mountain air. Whether you're an adventure seeker or a serenity lover, the Edges of the Mountain promise unforgettable moments. Bask in the beauty of sunrise over the peaks or relax under a starlit sky – a perfect escape from everyday life.",
  cities:
    "Experience the electrifying pulse of the City Vibe, where energy and excitement fill the air. From modern skyscrapers to historic landmarks, every corner of the city offers a unique blend of tradition and innovation. Explore bustling markets, enjoy world-class dining, and dive into vibrant nightlife that keeps the city alive around the clock. Perfect for urban explorers and culture enthusiasts, this destination is a melting pot of diversity, creativity, and endless opportunities for discovery. Whether you're savoring local street food, attending live events, or simply soaking in the cityscape, the City Vibe invites you to feel its rhythm and make unforgettable memories.",
  villages:
    "Step into a world of simplicity and charm with the Village Life Style, where the pace of life slows down, and traditions thrive. Surrounded by picturesque landscapes, these villages offer a warm welcome and an authentic cultural experience. Enjoy the rustic beauty of countryside living, indulge in homemade delicacies, and connect with nature in its purest form. Perfect for those seeking tranquility and authenticity, the Village Life Style provides a refreshing escape from the hustle and bustle of urban life. Whether it’s farming with locals, exploring scenic trails, or simply relaxing under a starlit sky, these villages promise unforgettable moments filled with peace and nostalgia.",
  wildlife:
    "Embark on a thrilling journey into the Wild Life, where nature reigns supreme, and adventure awaits. Explore dense forests, open savannahs, and vibrant ecosystems teeming with life. Witness majestic animals in their natural habitats, from elusive predators to colorful birds, and learn about the delicate balance of nature. Perfect for wildlife enthusiasts and photographers, this destination offers exhilarating safaris, serene nature walks, and unforgettable moments of connection with the wild. Whether you're watching the sunrise over a jungle canopy or hearing the distant call of wildlife at dusk, the Wild Life promises a once-in-a-lifetime experience that will leave you in awe of the planet’s untamed beauty."
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