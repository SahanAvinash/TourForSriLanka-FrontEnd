import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-[#00C896]/20 text-[#00C896]",
  rejected: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export default function YourBookings() {
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
          `${API_BASE_URL}/api/booking/traveler/${travelerId}`
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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/booking/${bookingId}/status`,
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

  if (!travelerId) return null;

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  return (
    <section className="px-8 py-8 bg-[#11212D]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[22px] font-bold text-white">Your Bookings</h2>

        {loadingBookings && (
          <p className="mt-3 text-[#d5dde2]">Loading your bookings...</p>
        )}

        {!loadingBookings && activeBookings.length === 0 && (
          <p className="mt-3 text-[#d5dde2]">
            You haven't booked any hotel room yet.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {activeBookings.map((b) => {
            const nights = Math.ceil(
              (new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={b._id}
                className="flex gap-4 bg-[#1B2B34] rounded-[20px] p-4 border border-white/10"
              >
                <img
                  src={b.roomId?.images?.[0] || "/room_placeholder.jpg"}
                  alt={b.roomId?.roomType}
                  className="w-32 h-24 object-cover rounded-[14px] flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      {b.hotelId?.hotelName}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyles[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#d5dde2] mt-1">
                    {b.roomId?.roomType} · Room {b.roomId?.roomNumber}
                  </p>
                  <p className="text-sm text-[#d5dde2] mt-1">
                    {new Date(b.checkInDate).toLocaleDateString()} – {new Date(b.checkOutDate).toLocaleDateString()}
                    {" "}({nights} night{nights !== 1 ? "s" : ""})
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
            );
          })}
        </div>
      </div>
    </section>
  );
}