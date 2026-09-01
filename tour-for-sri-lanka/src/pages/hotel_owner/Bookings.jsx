import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaEllipsisV,
  FaSearch,
  FaUser,
  FaCheck,
  FaTimes,
  FaBan,
} from "react-icons/fa";

function getAuthHeader() {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");

  const token =
    localToken && localToken !== "undefined"
      ? localToken
      : sessionToken;

  return {
    Authorization: `Bearer ${token}`,
  };
}

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "#E8A33D",
  },
  confirmed: {
    label: "Confirmed",
    color: "#00C896",
  },
  rejected: {
    label: "Rejected",
    color: "#CD2F31",
  },
  cancelled: {
    label: "Cancelled",
    color: "#CD2F31",
  },
  completed: {
    label: "Completed",
    color: "#4A9CD6",
  },
};

export default function Bookings() {
  const [hotelId, setHotelId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] =
    useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!storedUser) {
      setLoadingBookings(false);
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user?._id) {
        setHotelId(user._id);
      } else {
        setLoadingBookings(false);
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (hotelId) {
      fetchBookings();
    }
  }, [hotelId]);

  useEffect(() => {
    const handleResize = () => {
      setOpenMenuId(null);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  function fetchBookings() {
    if (!hotelId) return;

    setLoadingBookings(true);

    axios
      .get(
        `${API_BASE_URL}/api/booking/hotel/${hotelId}`,
        {
          headers: getAuthHeader(),
        }
      )
      .then((res) => {
        setBookings(
          Array.isArray(res.data) ? res.data : []
        );
      })
      .catch((error) => {
        console.error(
          "Failed to load bookings:",
          error
        );
        toast.error("Failed to load bookings");
      })
      .finally(() => {
        setLoadingBookings(false);
      });
  }

  function handleStatusChange(
    bookingId,
    newStatus
  ) {
    axios
      .patch(
        `${API_BASE_URL}/api/booking/${bookingId}/status`,
        {
          status: newStatus,
        },
        {
          headers: getAuthHeader(),
        }
      )
      .then(() => {
        toast.success(
          `Booking marked as ${newStatus}`
        );

        fetchBookings();
        setOpenMenuId(null);
      })
      .catch((error) => {
        console.error(
          "Failed to update booking:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to update booking"
        );
      });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleActionMenu(e, bookingId) {
    if (openMenuId === bookingId) {
      setOpenMenuId(null);
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const menuWidth = 180;
    const menuHeight = 150;
    const padding = 10;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 6;

    if (left < padding) {
      left = padding;
    }

    if (
      left + menuWidth >
      window.innerWidth - padding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        padding;
    }

    if (
      top + menuHeight >
      window.innerHeight - padding
    ) {
      top = rect.top - menuHeight - 6;
    }

    if (top < padding) {
      top = padding;
    }

    setMenuPosition({
      top,
      left,
    });

    setOpenMenuId(bookingId);
  }

  const filteredBookings = bookings.filter(
    (booking) => {
      const guestName =
        `${booking.travelerId?.firstName || ""} ${
          booking.travelerId?.lastName || ""
        }`.toLowerCase();

      const roomNumber = String(
        booking.roomId?.roomNumber || ""
      ).toLowerCase();

      const email = String(
        booking.travelerId?.email || ""
      ).toLowerCase();

      const term = searchTerm.toLowerCase();

      return (
        guestName.includes(term) ||
        roomNumber.includes(term) ||
        email.includes(term)
      );
    }
  );

  return (
    <section
      id="bookings"
      className="w-full mt-10 md:mt-12 px-4 sm:px-6 md:px-8 lg:px-10"
    >
      <div className="w-full max-w-[1100px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">
            Bookings
          </h1>
        </div>

        <div className="bg-[#253745] rounded-[20px] p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <h2 className="text-[#CCD0CF] text-[19px] sm:text-[20px] font-bold">
              All Bookings
            </h2>

            <div className="relative w-full lg:w-[280px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by guest or room number"
                className="w-full h-[42px] bg-[#4A5C6A]/50 rounded-[20px] pl-[16px] pr-[40px] text-[#CCD0CF] text-[13px] outline-none focus:ring-1 focus:ring-[#00C896]/50"
              />

              <FaSearch className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
            </div>
          </div>

          {loadingBookings ? (
            <div className="py-6">
              <p className="text-[#CCD0CF]/60 text-[14px]">
                Loading bookings...
              </p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-6">
              <p className="text-[#CCD0CF]/60 text-[14px]">
                No bookings found.
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="text-left text-[#CCD0CF] text-[13px] font-bold">
                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Guest
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Room
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Check-in
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Check-out
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Guests
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Total
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Status
                    </th>

                    <th className="pb-4 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map(
                    (booking) => {
                      const status =
                        STATUS_META[
                          booking.status
                        ] ||
                        STATUS_META.pending;

                      const photoUrl =
                        booking.travelerId?.image;

                      const guestName =
                        `${booking.travelerId?.firstName || ""} ${
                          booking.travelerId?.lastName || ""
                        }`.trim() ||
                        "Traveler";

                      return (
                        <tr
                          key={booking._id}
                          className="border-t border-[#4A5C6A]/40"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-[45px] h-[45px] rounded-full bg-[#1B2B34] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {photoUrl ? (
                                  <img
                                    src={photoUrl}
                                    alt={guestName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display =
                                        "none";

                                      if (
                                        e.currentTarget
                                          .nextSibling
                                      ) {
                                        e.currentTarget.nextSibling.style.display =
                                          "flex";
                                      }
                                    }}
                                  />
                                ) : null}

                                <FaUser
                                  className="text-[#4A5C6A] text-[16px]"
                                  style={{
                                    display: photoUrl
                                      ? "none"
                                      : "flex",
                                  }}
                                />
                              </div>

                              <div>
                                <p className="text-[#CCD0CF] font-bold text-[14px]">
                                  {guestName}
                                </p>

                                <p className="text-[#CCD0CF]/60 text-[12px]">
                                  {booking.travelerId
                                    ?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 pr-4 text-[#CCD0CF] text-[14px]">
                            <p className="font-bold">
                              {booking.roomId
                                ?.roomNumber || "-"}
                            </p>

                            <p className="text-[#CCD0CF]/60 text-[12px]">
                              {booking.roomId
                                ?.roomType || ""}
                            </p>
                          </td>

                          <td className="py-4 pr-4 text-[#CCD0CF] text-[14px] whitespace-nowrap">
                            {formatDate(
                              booking.checkInDate
                            )}
                          </td>

                          <td className="py-4 pr-4 text-[#CCD0CF] text-[14px] whitespace-nowrap">
                            {formatDate(
                              booking.checkOutDate
                            )}
                          </td>

                          <td className="py-4 pr-4 text-[#CCD0CF] text-[14px]">
                            {booking.numberOfGuests ??
                              "-"}
                          </td>

                          <td className="py-4 pr-4 text-[#CCD0CF] text-[14px] whitespace-nowrap">
                            LKR{" "}
                            {Number(
                              booking.totalPrice || 0
                            ).toLocaleString()}
                          </td>

                          <td className="py-4 pr-4">
                            <span className="flex items-center gap-2 text-[14px] whitespace-nowrap">
                              <span
                                className="w-[8px] h-[8px] rounded-full"
                                style={{
                                  backgroundColor:
                                    status.color,
                                }}
                              />

                              <span className="text-[#CCD0CF]">
                                {status.label}
                              </span>
                            </span>
                          </td>

                          <td className="py-4">
                            <button
                              type="button"
                              onClick={(e) =>
                                handleActionMenu(
                                  e,
                                  booking._id
                                )
                              }
                              className="text-[#CCD0CF]/60 hover:text-[#CCD0CF] active:scale-90 transition-all cursor-pointer p-2"
                            >
                              <FaEllipsisV />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {openMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
          />

          <div
            className="fixed bg-[#4A5C6A] rounded-[12px] overflow-hidden z-[9999] w-[180px] shadow-xl"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {(() => {
              const booking = bookings.find(
                (item) => item._id === openMenuId
              );

              if (!booking) return null;

              return (
                <>
                  {booking.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            booking._id,
                            "confirmed"
                          )
                        }
                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#00C896] text-[13px] hover:bg-[#00C896]/20 cursor-pointer"
                      >
                        <FaCheck />
                        Confirm
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            booking._id,
                            "rejected"
                          )
                        }
                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 cursor-pointer"
                      >
                        <FaTimes />
                        Reject
                      </button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            booking._id,
                            "completed"
                          )
                        }
                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#4A9CD6] text-[13px] hover:bg-[#4A9CD6]/10 cursor-pointer"
                      >
                        <FaCheck />
                        Mark Completed
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            booking._id,
                            "cancelled"
                          )
                        }
                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 cursor-pointer"
                      >
                        <FaBan />
                        Cancel
                      </button>
                    </>
                  )}

                  {(booking.status ===
                    "rejected" ||
                    booking.status ===
                      "cancelled" ||
                    booking.status ===
                      "completed") && (
                    <p className="px-4 py-3 text-[#CCD0CF]/50 text-[12px]">
                      No actions available
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </section>
  );
}