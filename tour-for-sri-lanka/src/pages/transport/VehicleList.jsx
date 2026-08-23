import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Users, Briefcase, MapPin } from "lucide-react";
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

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (type && type !== "all") params.append("type", type);
        if (passengers) params.append("passengers", passengers);
        if(pickupLocation) params.append("location", pickupLocation)
        if(bags) params.append("bags", bags)

        const res = await fetch(
          `${API_BASE_URL}/api/transport/vehicles?${params.toString()}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch vehicles");
        }

        setVehicles(data.vehicles || []);
      } catch (err) {
        console.log(err);
        setError("Could not load vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [type, passengers, pickupLocation, bags]);

  return (
    <main className="min-h-screen bg-[#071923] text-white flex flex-col">
      <Navbar />

      <section className="px-14 pt-28 pb-16 max-lg:px-5 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="text-[#00C896] text-sm mb-4 hover:underline"
        >
          &larr; Back
        </button>

        <h2 className="text-[26px] font-bold capitalize">
          Available {type === "all" ? "All Vehicles" : `${type}s`} 
        </h2>

        <p className="mt-1 text-[#d5dde2] text-sm">
          {pickupLocation && `From ${pickupLocation}`}
          {pickupDate && ` • ${pickupDate}`}
          {passengers && ` • ${passengers} passengers`}
          {bags && ` • ${bags}`}
        </p>

        {loading && (
          <p className="mt-10 text-[#d5dde2]">Loading vehicles...</p>
        )}

        {!loading && error && (
          <p className="mt-10 text-red-400">{error}</p>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <p className="mt-10 text-[#d5dde2]">
            No vehicles found for this type right now.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {vehicles.map((v, i) => (
            <div
              key={v._id}
              className="vehicle-card-anim flex gap-4 bg-[#1B2B34] rounded-[20px] p-4 border border-white/10"
              style={{animationDelay: `${i * 0.12}s`}}
            >
              <img
                src={v.addVehiclePhotos?.[0]}
                alt={`${v.vehicleBrand} ${v.vehicleModel}`}
                className="w-40 h-32 object-cover rounded-[14px] flex-shrink-0"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {v.vehicleBrand} {v.vehicleModel}
                </h3>
                <p className="text-sm text-[#d5dde2] mt-1 line-clamp-2">
                  {v.shortDescription}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm text-[#d5dde2]">
                  <span className="flex items-center gap-1">
                    <Users size={16} /> {v.passengerCapacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={16} /> {v.luggageCapacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> {v.availableArea?.[0]}
                    {v.availableArea?.length > 1 &&
                      ` +${v.availableArea.length - 1}`}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {v.profilePhoto && (
                      <img
                        src={v.profilePhoto}
                        alt={v.firstName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm text-[#d5dde2]">
                      {v.firstName} {v.lastName}
                    </span>
                  </div>

                    <button 
                        className="px-4 py-1.5 rounded-full bg-[#00C896] text-white text-sm font-medium hover:bg-[#00b383] transition"
                        onClick={() =>
                            navigate(`/transport/book/${v._id}`,{
                                state: {
                                    vehicle: v,
                                    searchContext: {
                                        pickupDate,
                                        numberOfPassengers: passengers ? Number(passengers) : "",
                                        bags: bags ? Number(bags) : "",
                                    },
                                },
                             })
                            }
                    >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
