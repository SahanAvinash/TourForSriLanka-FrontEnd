import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const DestinationInfo = ({ destination }) => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-12">

      <h1 className="text-5xl text-white font-bold">
        {destination.name}
      </h1>

      <div className="flex items-center gap-3 mt-5 text-[#00C896]">

        <FaMapMarkerAlt />

        <span>{destination.location}</span>

      </div>

      <p className="text-gray-300 leading-8 mt-8">
        {destination.description}
      </p>

      <Link
        to="/tours"
        className="inline-block mt-10 bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-8 py-4 rounded-full font-semibold"
      >
        Explore Tours
      </Link>

    </section>
  );
};

export default DestinationInfo;