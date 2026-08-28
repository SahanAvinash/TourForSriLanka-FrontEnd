import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Briefcase, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function VehicleList() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const passengers = searchParams.get("passengers");
  const bags = searchParams.get("bags");
  const service = searchParams.get("service");

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (type && type !== "all") {
          params.append("type", type);
        }

        if (passengers) {
          params.append("passengers", passengers);
        }

        if (pickupLocation) {
          params.append("location", pickupLocation);
        }

        if (bags) {
          params.append("bags", bags);
        }

        const res = await fetch(
          `${API_BASE_URL}/api/transport/vehicles?${params.toString()}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to fetch vehicles"
          );
        }

        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : []);
      } catch (err) {
        console.log(err);
        setError("Could not load vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [type, passengers, pickupLocation, bags]);

  const handleBookNow = (vehicle) => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!storedUser) {
      toast.error("Please login and try again.");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      toast.error("Please login and try again.");
      return;
    }

    if (user.role !== "Traveler") {
      toast.error("please login as a traveler.");
      return;
    }

    navigate(`/transport/book/${vehicle._id}`, {
      state: {
        vehicle,
        searchContext: {
          pickupDate,
          numberOfPassengers: passengers ? Number(passengers) : "",
          bags: bags ? Number(bags) : "",
        },
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#071923] text-white flex flex-col">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-14 pt-24 sm:pt-28 pb-12 sm:pb-16 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="text-[#00C896] text-sm mb-4 hover:underline"
        >
          &larr; Back
        </button>

        <h2 className="text-xl sm:text-[26px] font-bold capitalize">
          Available {type === "all" ? "All Vehicles" : `${type}s`}
        </h2>

        {(pickupLocation || pickupDate || passengers || bags || service) && (
          <p className="mt-2 text-[#d5dde2] text-xs sm:text-sm break-words">
            {pickupLocation && `From ${pickupLocation}`}
            {pickupDate && ` • ${pickupDate}`}
            {passengers && ` • ${passengers} passengers`}
            {bags && ` • ${bags}`}
          </p>
        )}

        {loading && (
          <p className="mt-8 sm:mt-10 text-[#d5dde2]">
            Loading vehicles...
          </p>
        )}

        {!loading && error && (
          <p className="mt-8 sm:mt-10 text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <p className="mt-8 sm:mt-10 text-[#d5dde2]">
            No vehicles found for this type right now.
          </p>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle._id}
                className="vehicle-card-anim bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4 border border-white/10"
                style={{
                  animationDelay: `${index * 0.12}s`,
                }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={vehicle.addVehiclePhotos?.[0]}
                    alt={`${vehicle.vehicleBrand} ${vehicle.vehicleModel}`}
                    className="w-full sm:w-40 h-44 sm:h-32 object-cover rounded-[14px] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold break-words">
                      {vehicle.vehicleBrand} {vehicle.vehicleModel}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#d5dde2] mt-1 line-clamp-2">
                      {vehicle.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs sm:text-sm text-[#d5dde2]">
                      <span className="flex items-center gap-1">
                        <Users size={15} />
                        {vehicle.passengerCapacity}
                      </span>

                      <span className="flex items-center gap-1">
                        <Briefcase size={15} />
                        {vehicle.luggageCapacity}
                      </span>

                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin size={15} />

                        <span className="truncate">
                          {vehicle.availableArea?.[0]}

                          {vehicle.availableArea?.length > 1 &&
                            ` +${vehicle.availableArea.length - 1}`}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 min-w-0">
                    {vehicle.profilePhoto && (
                      <img
                        src={vehicle.profilePhoto}
                        alt={vehicle.firstName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    )}

                    <span className="text-xs sm:text-sm text-[#d5dde2] truncate">
                      {vehicle.firstName} {vehicle.lastName}
                    </span>
                  </div>

                  <button
                    className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#00C896] text-white text-sm font-medium hover:bg-[#00b383] transition"
                    onClick={() => handleBookNow(vehicle)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}