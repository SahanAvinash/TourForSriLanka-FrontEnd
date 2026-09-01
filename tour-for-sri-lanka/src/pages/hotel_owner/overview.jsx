import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
    FaBed,
    FaCalendarCheck,
    FaStar,
} from "react-icons/fa";
import { GrVmMaintenance } from "react-icons/gr";
import {
    MdVerified,
    MdEventAvailable,
    MdPending,
} from "react-icons/md";
import axios from "axios";

export default function Overview() {
    const [roomCount, setRoomCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);
    const [hotelName, setHotelName] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [availableRooms, setAvailableRooms] = useState(0);
    const [maintenanceRooms, setMaintenanceRooms] = useState(0);
    const [todayBookings, setTodayBookings] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
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
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (!storedUser) {
            setLoadingStats(false);
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch {
            setLoadingStats(false);
            return;
        }

        const hotelId = user._id;

        if (!hotelId) {
            setLoadingStats(false);
            return;
        }

        setHotelName(user.hotelName || "");

        axios
            .get(`${API_BASE_URL}/api/hotel/${hotelId}`)
            .then((res) => {
                setIsApproved(res.data?.isApproved === true);
            })
            .catch(() => {});

        axios
            .get(`${API_BASE_URL}/api/addRoom/hotel/${hotelId}`)
            .then((res) => {
                const rooms = Array.isArray(res.data)
                    ? res.data
                    : [];

                setRoomCount(rooms.length);

                setAvailableRooms(
                    rooms.filter(
                        (room) =>
                            room.status === "available"
                    ).length
                );

                setMaintenanceRooms(
                    rooms.filter(
                        (room) =>
                            room.status === "maintenance"
                    ).length
                );
            })
            .catch(() => {})
            .finally(() => {
                setLoadingStats(false);
            });

        axios
            .get(`${API_BASE_URL}/api/booking/hotel/${hotelId}`)
            .then((res) => {
                const bookings = Array.isArray(res.data)
                    ? res.data
                    : [];

                const todayStr =
                    new Date().toDateString();

                setPendingBookings(
                    bookings.filter(
                        (booking) =>
                            booking.status === "pending"
                    ).length
                );

                setTodayBookings(
                    bookings.filter((booking) => {
                        if (!booking.checkInDate) {
                            return false;
                        }

                        return (
                            new Date(
                                booking.checkInDate
                            ).toDateString() === todayStr
                        );
                    }).length
                );
            })
            .catch(() => {});

        axios
            .get(`${API_BASE_URL}/api/review/hotel/${hotelId}`)
            .then((res) => {
                const reviews = Array.isArray(res.data)
                    ? res.data
                    : [];

                if (reviews.length > 0) {
                    const validReviews = reviews.filter(
                        (review) =>
                            Number.isFinite(
                                Number(review.rating)
                            )
                    );

                    if (validReviews.length > 0) {
                        const avg =
                            validReviews.reduce(
                                (sum, review) =>
                                    sum +
                                    Number(review.rating),
                                0
                            ) /
                            validReviews.length;

                        setAverageRating(avg);
                        setReviewCount(
                            validReviews.length
                        );
                    }
                }
            })
            .catch(() => {});
    }, []);

    const stats = [
        {
            label: "Total Rooms",
            value: roomCount,
            icon: <FaBed />,
        },
        {
            label: "Available Rooms",
            value: availableRooms,
            icon: <MdEventAvailable />,
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
            label: "Maintenance Rooms",
            value: maintenanceRooms,
            icon: <GrVmMaintenance />,
        },
        {
            label: "Average Rating",
            value:
                reviewCount > 0 ? (
                    <>
                        {averageRating.toFixed(1)}
                        <span className="text-[#FFC107] ml-1">
                            ★
                        </span>
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
            className="w-full flex flex-col justify-start items-start px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 overflow-x-hidden"
        >
            <div className="w-full max-w-[1100px] mx-auto">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">
                            Overview
                        </h1>

                        {isApproved && (
                            <MdVerified className="text-[#00C896] text-2xl sm:text-3xl" />
                        )}
                    </div>

                    <span className="text-[#CCD0CF]/60 text-xs sm:text-sm">
                        {today}
                    </span>
                </div>

                <div className="w-full flex items-center justify-start mb-6">
                    <p className="text-[#CCD0CF] text-sm sm:text-base font-medium">
                        {hotelName}
                    </p>
                </div>

                {!isApproved && !loadingStats && (
                    <div className="w-full bg-[#4A5C6A]/30 border border-[#CD2F31]/40 rounded-[20px] px-4 sm:px-6 py-4 mb-6 flex items-center gap-3">
                        <MdPending className="text-[#00C896] text-xl sm:text-2xl flex-shrink-0" />

                        <div>
                            <p className="text-[#CCD0CF] text-xs sm:text-sm font-semibold">
                                Verification Pending
                            </p>

                            <p className="text-[#CCD0CF]/60 text-[11px] sm:text-xs">
                                Your hotel is under review.
                                Some features may be
                                limited until approval.
                            </p>
                        </div>
                    </div>
                )}

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4 w-full min-h-[90px] transition-transform duration-300 hover:-translate-y-1"
                        >
                            <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                                {stat.icon}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[#CCD0CF]/60 text-xs">
                                    {stat.label}
                                </p>

                                <p
                                    className={`text-[#CCD0CF] font-bold ${
                                        stat.rating
                                            ? "text-xl"
                                            : "text-2xl"
                                    }`}
                                >
                                    {loadingStats
                                        ? "..."
                                        : stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}