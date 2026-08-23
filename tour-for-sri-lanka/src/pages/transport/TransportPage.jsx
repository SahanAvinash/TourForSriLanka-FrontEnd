import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import TransportHeroSection from "./TransportHeroSection";
import VehicleTypeCard from "./VehicleTypeCard";
import { vehicleTypes } from "../../data/vehicles";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-[#00C896]/20 text-[#00C896]",
  rejected: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export default function TransportPage() {
  const navigate = useNavigate();
  const vehicleTypeSectionRef = useRef(null);

  const [service, setService] = useState("airport-pickup");
  const [form, setForm] = useState({
    pickupLocation: "",
    pickupDate: "",
    passengers: "",
    bags: "",
  });

  const storedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const travelerId = storedUser?._id;

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!travelerId) {
      setLoadingBookings(false);
      return;
    }
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const res = await fetch(
          `http://localhost:3000/api/transport/bookings/traveler/${travelerId}`
        );
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [travelerId]);

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openVehicles = (type) => {
    const params = new URLSearchParams({
      service,
      pickupLocation: form.pickupLocation,
      pickupDate: form.pickupDate,
      passengers: form.passengers,
      bags: form.bags,
    });

    navigate(`/transport/vehicles/${type}?${params.toString()}`);
  };

  const handleSearch = () => {
    vehicleTypeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(
        `http://localhost:3000/api/transport/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#071923] text-white">
      <Navbar />
      <TransportHeroSection
        service={service}
        setService={setService}
        form={form}
        updateForm={updateForm}
        onSearch={handleSearch}
      />

      {travelerId && (
        <section className="px-14 py-8 max-lg:px-5">
          <h2 className="text-[22px] font-bold">Your Bookings</h2>

          {loadingBookings && (
            <p className="mt-3 text-[#d5dde2]">Loading your bookings...</p>
          )}

          {!loadingBookings && bookings.filter((b) => b.status !== "cancelled").length === 0 && (
            <p className="mt-3 text-[#d5dde2]">
              You haven't booked any vehicle yet.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            {bookings.filter((b) => b.status !== "cancelled").map((b) => (
              <div
                key={b._id}
                className="flex gap-4 bg-[#1B2B34] rounded-[20px] p-4 border border-white/10"
              >
                <img
                  src={b.vehicleId?.addVehiclePhotos?.[0]}
                  alt={`${b.vehicleId?.vehicleBrand} ${b.vehicleId?.vehicleModel}`}
                  className="w-32 h-24 object-cover rounded-[14px] flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {b.vehicleId?.vehicleBrand} {b.vehicleId?.vehicleModel}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyles[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#d5dde2] mt-1">
                    {b.pickupLocation} → {b.dropoffLocation}
                  </p>
                  <p className="text-sm text-[#d5dde2] mt-1">
                    {new Date(b.pickupDate).toLocaleDateString()}
                    {new Date(b.returnDate).toDateString() !==
                      new Date(b.pickupDate).toDateString() &&
                      ` – ${new Date(b.returnDate).toLocaleDateString()}`}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-semibold text-[#00C896]">
                      Rs. {b.totalPrice?.toLocaleString()}
                    </p>
                    {b.status === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                        className="text-xs px-3 py-1 rounded-full border border-red-400 text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition"
                      >
                        {cancellingId === b._id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section ref={vehicleTypeSectionRef} className="px-14 py-8 max-lg:px-5">
        <h2 className="text-[22px] font-bold">Select your vehicle type</h2>
        <p className="mt-1 text-[#d5dde2]">
          All vehicles are with professional drivers
        </p>

        <div className="mt-3.5 grid grid-cols-4 gap-[62px] max-lg:grid-cols-1 max-lg:gap-6">
          {vehicleTypes.map((item) => (
            <VehicleTypeCard
              key={item.type}
              item={item}
              onClick={() => openVehicles(item.type)}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}