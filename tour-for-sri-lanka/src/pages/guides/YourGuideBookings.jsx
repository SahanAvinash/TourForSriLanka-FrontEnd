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

export default function YourGuideBookings() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

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
    if (!token || !travelerId) {
      setLoadingBookings(false);
      return;
    }

    const fetchBookings = async () => {
      setLoadingBookings(true);

      try {
        const res = await fetch(`${API_BASE_URL}/api/guidebooking/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [token, travelerId]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    setCancellingId(bookingId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/guidebooking/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  if (!token || !travelerId) return null;

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled"
  );

  return (
    <section className="bg-[#11212D] px-5 py-8 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-[20px] font-bold text-white sm:text-[22px]">
          Your Bookings
        </h2>

        {loadingBookings && (
          <p className="mt-3 text-sm text-[#d5dde2]">
            Loading your bookings...
          </p>
        )}

        {!loadingBookings && activeBookings.length === 0 && (
          <p className="mt-3 text-sm text-[#d5dde2]">
            You haven't booked any guide yet.
          </p>
        )}

        {!loadingBookings && activeBookings.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {activeBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-[#1B2B34] p-4 sm:flex-row"
              >
                <img
                  src={
                    booking.guideId?.profilePic ||
                    "/guide_placeholder.jpg"
                  }
                  alt={`${booking.guideId?.firstName || ""} ${
                    booking.guideId?.lastName || ""
                  }`}
                  className="h-44 w-full flex-shrink-0 rounded-[14px] object-cover sm:h-28 sm:w-32"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-base font-semibold text-white sm:text-lg">
                      {booking.guideId?.firstName}{" "}
                      {booking.guideId?.lastName}
                    </h3>

                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] capitalize sm:text-xs ${
                        statusStyles[booking.status]
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-xs text-[#d5dde2] sm:text-sm">
                    {booking.guideId?.district}
                    {booking.guideId?.province
                      ? `, ${booking.guideId.province}`
                      : ""}
                  </p>

                  <p className="mt-1 break-words text-xs leading-relaxed text-[#d5dde2] sm:text-sm">
                    {new Date(booking.date).toLocaleDateString()} ·{" "}
                    {booking.quantity}{" "}
                    {booking.durationType === "hourly"
                      ? booking.quantity === 1
                        ? "hour"
                        : "hours"
                      : booking.quantity === 1
                      ? "day"
                      : "days"}{" "}
                    · {booking.numberOfGuests}{" "}
                    {booking.numberOfGuests !== 1 ? "guests" : "guest"}
                  </p>

                  <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-0">
                    <p className="text-sm font-semibold text-[#00C896] sm:text-base">
                      {booking.guideId?.currency}{" "}
                      {booking.totalPrice?.toLocaleString()}
                    </p>

                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="w-full rounded-full border border-red-400 px-3 py-2 text-xs text-red-400 transition hover:bg-red-400/10 disabled:opacity-50 sm:w-auto sm:py-1"
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
      </div>
    </section>
  );
}