import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
    FaStar,
    FaMoneyBillWave,
} from "react-icons/fa";
import {
    MdVerified,
    MdPending,
} from "react-icons/md";
import axios from "axios";

export default function Overview() {
    const [loadingStats, setLoadingStats] = useState(true);
    const [guideName, setGuideName] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [pricePerDay, setPricePerDay] = useState(0);
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

        const guideId = user._id;

        if (!guideId) {
            setLoadingStats(false);
            return;
        }

        setGuideName(`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "");

        // FIX: Changed from `/api/guides/` to `/api/guide/` to match backend route
        axios
            .get(`${API_BASE_URL}/api/guide/${guideId}`)
            .then((res) => {
                setIsApproved(res.data?.isApproved === true);
                setPricePerDay(res.data?.pricePerDay || 0);
            })
            .catch((err) => {
                console.error("Error fetching guide stats:", err);
            })
            .finally(() => {
                setLoadingStats(false);
            });

    }, []);

    const stats = [
        {
            label: "Price Per Day",
            value: `Rs. ${pricePerDay}`,
            icon: <FaMoneyBillWave />,
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
            className="w-full flex flex-col justify-start items-start px-0 pt-2 overflow-x-hidden"
        >
            <div className="w-full">
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
                        {guideName}
                    </p>
                </div>

                {/* Verification Pending Banner */}
                {!isApproved && !loadingStats && (
                    <div className="w-full bg-[#4A5C6A]/30 border border-[#CD2F31]/40 rounded-[20px] px-4 sm:px-6 py-4 mb-6 flex items-center gap-3">
                        <MdPending className="text-[#00C896] text-xl sm:text-2xl flex-shrink-0" />

                        <div>
                            <p className="text-[#CCD0CF] text-xs sm:text-sm font-semibold">
                                Verification Pending
                            </p>

                            <p className="text-[#CCD0CF]/60 text-[11px] sm:text-xs">
                                Your profile or pricing details are under review. Some features may be limited until admin approval.
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