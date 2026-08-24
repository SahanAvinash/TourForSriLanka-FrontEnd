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
          `${API_BASE_URL}/api/booking/traveler/${travelerId}`
        );

        const data = await res.json();

        if (res.ok) {
          setBookings(Array.isArray(data) ? data : []);
        }
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

  if (!travelerId) return null;

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled"
  );

  return (
    <section className="bg-[#11212D] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-white">
              Your Bookings
            </h2>
          </div>
        </div>

        {loadingBookings && (
          <p className="text-[13px] sm:text-[14px] text-[#d5dde2]">
            Loading your bookings...
          </p>
        )}

        {!loadingBookings && activeBookings.length === 0 && (
          <p className="text-[13px] sm:text-[14px] text-[#d5dde2]">
            You haven't booked any hotel room yet.
          </p>
        )}

        {!loadingBookings && activeBookings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            {activeBookings.map((booking) => {
              const nights = Math.ceil(
                (new Date(booking.checkOutDate) -
                  new Date(booking.checkInDate)) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={booking._id}
                  className="w-full flex flex-col sm:flex-row gap-4 bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-4 border border-white/10"
                >
                  <img
                    src={
                      booking.roomId?.images?.[0] ||
                      "/room_placeholder.jpg"
                    }
                    alt={booking.roomId?.roomType || "Room"}
                    className="w-full h-[180px] sm:w-[125px] sm:h-[100px] object-cover rounded-[12px] sm:rounded-[14px] shrink-0"
                  />

                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-white text-[14px] sm:text-[15px] truncate">
                        {booking.hotelId?.hotelName}
                      </h3>

                      <span
                        className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full capitalize shrink-0 ${
                          statusStyles[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-[12px] sm:text-[13px] text-[#d5dde2] mt-1">
                      {booking.roomId?.roomType} · Room{" "}
                      {booking.roomId?.roomNumber}
                    </p>

                    <p className="text-[12px] sm:text-[13px] text-[#d5dde2] mt-1">
                      {new Date(
                        booking.checkInDate
                      ).toLocaleDateString()}{" "}
                      –{" "}
                      {new Date(
                        booking.checkOutDate
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-[11px] sm:text-[12px] text-gray-400 mt-1">
                      {nights} night{nights !== 1 ? "s" : ""}
                    </p>

                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mt-3">
                      <p className="text-[13px] sm:text-[14px] font-semibold text-[#00C896]">
                        Rs. {booking.totalPrice?.toLocaleString()}
                      </p>

                      {booking.status === "pending" && (
                        <button
                          onClick={() =>
                            handleCancelBooking(booking._id)
                          }
                          disabled={cancellingId === booking._id}
                          className="w-full xs:w-auto text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-red-400 text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition"
                        >
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}