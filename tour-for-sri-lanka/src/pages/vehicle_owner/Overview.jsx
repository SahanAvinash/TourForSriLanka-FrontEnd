import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaStar,
  FaMoneyBillWave,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";
import axios from "axios";

export default function Overview() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  const [todayBookings, setTodayBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedTrips, setCompletedTrips] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!storedUser) {
      setLoadingStats(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const transportId = user._id;

    setOwnerName(user.firstName || "");

    axios
      .get(`${API_BASE_URL}/api/transport/${transportId}`)
      .then((res) => {
        setIsApproved(res.data.isApproved || false);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(`${API_BASE_URL}/api/booking/transport/${transportId}`)
      .then((res) => {
        const bookings = res.data;
        const todayStr = new Date().toDateString();

        setTodayBookings(
          bookings.filter(
            (b) => new Date(b.pickupDate).toDateString() === todayStr
          ).length
        );
        setPendingBookings(
          bookings.filter((b) => b.status === "pending").length
        );
        setTotalBookings(bookings.length);
        setCompletedTrips(
          bookings.filter((b) => b.status === "completed").length
        );
        setTotalEarnings(
          bookings
            .filter((b) => b.status === "completed")
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        );
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoadingStats(false);
      });

    axios
      .get(`${API_BASE_URL}/api/transport-review/vehicle/${transportId}`)
      .then((res) => {
        const reviews = res.data;

        if (reviews.length > 0) {
          const avg =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

          setAverageRating(avg);
          setReviewCount(reviews.length);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: <FaClipboardList />,
    },
    {
      label: "Total Earnings",
      value: `Rs. ${totalEarnings.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
    },
    {
      label: "Today Bookings",
      value: todayBookings,
      icon: <FaCalendarCheck />,
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      icon: <MdPending />,
    },
    {
      label: "Completed Trips",
      value: completedTrips,
      icon: <FaCheckCircle />,
    },
    {
      label: "Average Rating",
      value:
        reviewCount > 0 ? (
          <>
            {averageRating.toFixed(1)}
            <span className="text-[#FFC107] ml-1">★</span>
          </>
        ) : (
          "No reviews yet"
        ),
      icon: <FaStar />,
      rating: true,
    },
  ];

  return (
    <section
      id="overview"
      className="w-full flex flex-col justify-start items-start px-4 sm:px-6 md:px-8 lg:px-10 pt-16 sm:pt-20 overflow-x-hidden"
    >
      {!isApproved && !loadingStats && (
        <div className="vehicle-owner-alert-anim w-full max-w-[1100px] bg-[#4A5C6A]/30 border border-[#CD2F31]/40 rounded-[20px] px-4 sm:px-6 py-4 mb-6 flex items-center gap-3">
          <MdPending className="text-[#00C896] text-xl sm:text-2xl flex-shrink-0" />

          <div>
            <p className="text-[#CCD0CF] text-xs sm:text-sm font-semibold">
              Verification Pending
            </p>

            <p className="text-[#CCD0CF]/60 text-[11px] sm:text-xs">
              Your account is under review. Some features may be limited
              until approval.
            </p>
          </div>
        </div>
      )}

      <div className="vehicle-owner-header-anim w-full max-w-[1100px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">
            Overview
          </h1>

          {isApproved && (
            <MdVerified className="text-[#00C896] text-2xl sm:text-3xl" />
          )}
        </div>

        <span className="text-[#CCD0CF]/60 text-xs sm:text-sm">{today}</span>
      </div>

      <div className="vehicle-owner-header-anim w-full max-w-[1100px] flex items-center justify-start mb-6">
        <p className="text-[#CCD0CF] text-sm sm:text-base font-medium">
          {ownerName}
        </p>
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4 w-full min-h-[90px] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
              {stat.icon}
            </div>

            <div className="min-w-0">
              <p className="text-[#CCD0CF]/60 text-xs">{stat.label}</p>

              <p
                className={`text-[#CCD0CF] font-bold ${
                  stat.rating ? "text-xl" : "text-2xl"
                }`}
              >
                {loadingStats ? "..." : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}