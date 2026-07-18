import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const DestinationCard = ({ destination }) => {
  return (
    <div className="bg-[#253745] rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 transition duration-300">

      <img
        src={destination.image}
        alt={destination.name}
        className="w-full h-60 object-cover"
      />

      <div className="p-5">
        <h2 className="text-white text-2xl font-bold">
          {destination.name}
        </h2>

        <div className="flex items-center gap-2 mt-3 text-[#00C896]">
          <FaMapMarkerAlt />
          <span>{destination.location}</span>
        </div>

        <p className="text-gray-400 mt-4 line-clamp-2">
          {destination.description}
        </p>

        <Link
          to={`/destinations/${destination.category}/${destination.id}`}
          className="inline-block mt-6 bg-[#00C896] px-6 py-3 rounded-xl text-white font-semibold hover:bg-[#00b383]"
        >
          View Destination
        </Link>

      </div>

    </div>
  );
};

export default DestinationCard;