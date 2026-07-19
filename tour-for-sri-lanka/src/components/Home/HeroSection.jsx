import { Link } from "react-router-dom";
import hero from "../../assets/home/hero.jpg";
import Navbar from "../Navbar";


const HeroSection = () => {
  return (
    <section className="">
      <Navbar />
      <div className="relative w-full h-[720px]  overflow-hidden">

        {/* Background Image */}
        <img
          src={hero}
          alt="Sri Lanka"
          className="w-full h-full object-cover"
        />

        {/* Light Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-8">

            <div className="max-w-lg">

              <h3 className="text-[#CCD0CF] uppercase tracking-[5px] text-[48px] font-antonsc">
                Welcome!
              </h3>

              <p className="mt-6 text-gray-200 text-lg leading-8">
                We are a Sri Lankan based tourism organization providing
                comprehensive travel information, unforgettable experiences,
                and personalized tours across the beautiful island of Sri
                Lanka.
              </p>

              <Link
                to="/tours"
                className="
                  inline-block
                  mt-8
                  bg-[#00C896]
                  hover:bg-[#00b383]
                  transition-all
                  duration-300
                  px-8
                  py-3
                  rounded-full
                  font-semibold
                  text-white
                  shadow-lg
                "
              >
                Plan Your Trip
              </Link>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;