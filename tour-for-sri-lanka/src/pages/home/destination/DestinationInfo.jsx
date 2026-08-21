import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTrip } from "../../../context/TripContext";

const hideLocationIds = ["v-1", "v-2", "v-3", "v-4"];

const DestinationInfo = ({ destination }) => {
  const { isInTrip, toggleDestination } = useTrip();
  const inTrip = isInTrip(destination._id);

  const handleAddToTrip = () => {
    const isLoggedIn =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!isLoggedIn) {
      toast.error("Please log in to add destinations to your trip");
      return;
    }

    toggleDestination(destination);
    toast.success(inTrip ? "Removed from your trip" : "Added to your trip");
  };

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-5xl text-white font-bold">{destination.name}</h1>

      {!hideLocationIds.includes(destination.id) && (
        <div className="flex items-center gap-3 mt-5 text-[#00C896]">
          <FaMapMarkerAlt />
          <span>{destination.location}</span>
        </div>
      )}

      <p className="text-gray-300 leading-8 mt-8">{destination.description}</p>

      <div className="flex items-center gap-4 mt-10">
        <Link
          to="/tours"
          className="inline-block bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-8 py-4 rounded-full font-semibold"
        >
          Explore Tours
        </Link>

        <button
          onClick={handleAddToTrip}
          className={`inline-block duration-300 px-8 py-4 rounded-full font-semibold border-2 ${
            inTrip
              ? "bg-[#00C896] border-[#00C896] text-white hover:bg-[#00b383]"
              : "bg-transparent border-[#00C896] text-[#00C896] hover:bg-[#00C896]/10"
          }`}
        >
          {inTrip ? "Remove from My Trip" : "Add to My Trip"}
        </button>
      </div>
    </section>
  );
};

export default DestinationInfo;