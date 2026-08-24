import { API_BASE_URL } from "../../config/api";
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
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
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
          `${API_BASE_URL}/api/transport/bookings/traveler/${travelerId}`
        );

        const data = await res.json();

        if (res.ok) {
          setBookings(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [travelerId]);

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    vehicleTypeSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    setCancellingId(bookingId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/transport/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      setBookings((prev) =>
        prev.filter((booking) => booking._id !== bookingId)
      );

      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled"
  );

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
        <section className="px-4 sm:px-6 lg:px-14 py-6 sm:py-8">
          <h2 className="text-xl sm:text-[22px] font-bold">
            Your Bookings
          </h2>

          {loadingBookings && (
            <p className="mt-3 text-sm sm:text-base text-[#d5dde2]">
              Loading your bookings...
            </p>
          )}

          {!loadingBookings && activeBookings.length === 0 && (
            <p className="mt-3 text-sm sm:text-base text-[#d5dde2]">
              You haven't booked any vehicle yet.
            </p>
          )}

          {activeBookings.length > 0 && (
            <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {activeBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col sm:flex-row gap-4 bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4 border border-white/10"
                >
                  <img
                    src={booking.vehicleId?.addVehiclePhotos?.[0]}
                    alt={`${booking.vehicleId?.vehicleBrand || ""} ${
                      booking.vehicleId?.vehicleModel || ""
                    }`}
                    className="w-full sm:w-32 h-44 sm:h-24 object-cover rounded-[14px] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-base sm:text-lg break-words">
                        {booking.vehicleId?.vehicleBrand}{" "}
                        {booking.vehicleId?.vehicleModel}
                      </h3>

                      <span
                        className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full capitalize shrink-0 ${
                          statusStyles[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#d5dde2] mt-2 break-words">
                      {booking.pickupLocation} → {booking.dropoffLocation}
                    </p>

                    <p className="text-xs sm:text-sm text-[#d5dde2] mt-1">
                      {new Date(
                        booking.pickupDate
                      ).toLocaleDateString()}

                      {new Date(
                        booking.returnDate
                      ).toDateString() !==
                        new Date(
                          booking.pickupDate
                        ).toDateString() &&
                        ` – ${new Date(
                          booking.returnDate
                        ).toLocaleDateString()}`}
                    </p>

                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mt-3">
                      <p className="text-sm font-semibold text-[#00C896]">
                        Rs. {booking.totalPrice?.toLocaleString()}
                      </p>

                      {booking.status === "pending" && (
                        <button
                          onClick={() =>
                            handleCancelBooking(booking._id)
                          }
                          disabled={cancellingId === booking._id}
                          className="self-start xs:self-auto text-xs px-3 py-1.5 rounded-full border border-red-400 text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition"
                        >
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section
        ref={vehicleTypeSectionRef}
        className="scroll-mt-24 px-4 sm:px-6 lg:px-14 py-8"
      >
        <h2 className="text-xl sm:text-[22px] font-bold">
          Select your vehicle type
        </h2>

        <p className="mt-1 text-sm sm:text-base text-[#d5dde2]">
          All vehicles are with professional drivers
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-[62px]">
          {vehicleTypes.map((item, index) => (
            <VehicleTypeCard
              key={item.type}
              item={item}
              index={index}
              onClick={() => openVehicles(item.type)}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}