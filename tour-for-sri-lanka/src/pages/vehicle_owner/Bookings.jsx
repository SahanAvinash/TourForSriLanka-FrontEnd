import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FaSearch, FaUser, FaCheck, FaTimes, FaBan, FaEllipsisV
} from "react-icons/fa";
import ScrollFadeIn from "../../components/ScrollFadeIn";

function getAuthHeader() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
}

const STATUS_META = {
    pending: { label: "Pending", color: "#E8A33D" },
    confirmed: { label: "Confirmed", color: "#00C896" },
    rejected: { label: "Rejected", color: "#CD2F31" },
    cancelled: { label: "Cancelled", color: "#CD2F31" },
    completed: { label: "Completed", color: "#4A9CD6" }
};

export default function Bookings() {
    const [transportId, setTransportId] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        setTransportId(user._id);
    }, []);

    useEffect(() => {
        if (transportId) fetchBookings();
    }, [transportId]);

    function fetchBookings() {
        setLoadingBookings(true);
        axios.get(`${API_BASE_URL}/api/transport/bookings/vehicle/${transportId}`)
            .then((res) => {
                setBookings(res.data);
            }).catch((error) => {
                console.log(error);
                toast.error("Failed to load bookings");
            }).finally(() => {
                setLoadingBookings(false);
            });
    }

    function handleStatusChange(bookingId, newStatus) {
        axios.patch(`${API_BASE_URL}/api/transport/bookings/${bookingId}/status`, { status: newStatus }, {
            headers: getAuthHeader()
        }).then(() => {
            toast.success(`Booking marked as ${newStatus}`);
            fetchBookings();
            setOpenMenuId(null);
        }).catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update booking");
        });
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString("en-US", {
            day: "2-digit", month: "short", year: "numeric"
        });
    }

    const filteredBookings = bookings.filter((b) => {
        const travelerName = b.travelerId?.firstName?.toLowerCase() || "";
        const vehicleNumber = b.vehicleId?.vehicleNumber?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return travelerName.includes(term) || vehicleNumber.includes(term);
    });

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">Bookings</h1>
            </div>

            <div className="bg-[#253745] rounded-[20px] p-4 sm:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                    <h2 className="text-[#CCD0CF] text-[18px] sm:text-[20px] font-bold">All Bookings</h2>
                    <div className="relative w-full sm:w-[280px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by traveler or vehicle"
                            className="w-full h-[40px] sm:h-[42px] bg-[#4A5C6A]/50 rounded-[20px] pl-[16px] pr-[40px] text-[#CCD0CF] text-[13px] outline-none"
                        />
                        <FaSearch className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
                    </div>
                </div>

                {loadingBookings ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">Loading bookings...</p>
                ) : filteredBookings.length === 0 ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">No bookings found.</p>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr className="text-left text-[#CCD0CF] text-[13px] font-bold border-b border-[#4A5C6A]/40">
                                    <th className="pb-4 pr-4">Traveler</th>
                                    <th className="pb-4 pr-4">Vehicle</th>
                                    <th className="pb-4 pr-4">Start Date</th>
                                    <th className="pb-4 pr-4">End Date</th>
                                    <th className="pb-4 pr-4">Total</th>
                                    <th className="pb-4 pr-4">Status</th>
                                    <th className="pb-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking, index) => {
                                    const status = STATUS_META[booking.status] || STATUS_META.pending;
                                    return (
                                        <ScrollFadeIn
                                            key={booking._id}
                                            as="tr"
                                            className="border-t border-[#4A5C6A]/30 hover:bg-[#4A5C6A]/10 transition-colors"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-full bg-[#1B2B34] flex items-center justify-center flex-shrink-0">
                                                        <FaUser className="text-[#4A5C6A] text-[15px]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[#CCD0CF] font-bold text-[13px] sm:text-[14px] truncate">
                                                            {`${booking.travelerId?.firstName || ""} ${booking.travelerId?.lastName || ""}`.trim() || "Traveler"}
                                                        </p>
                                                        <p className="text-[#CCD0CF]/60 text-[11px] sm:text-[12px] truncate">
                                                            {booking.travelerId?.email || ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px]">
                                                <p className="font-bold">{booking.vehicleId?.registrationNo || "-"}</p>
                                            </td>
                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px]">
                                                {formatDate(booking.pickupDate)}
                                            </td>
                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px]">
                                                {new Date(booking.pickupDate).toDateString() === new Date(booking.returnDate).toDateString()
                                                    ? <span className="text-[#CCD0CF]/60">One Way</span>
                                                    : formatDate(booking.returnDate)}
                                            </td>
                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px] font-medium">
                                                LKR {Number(booking.totalPrice).toLocaleString()}
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span className="flex items-center gap-2 text-[13px] sm:text-[14px]">
                                                    <span
                                                        className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: status.color }}
                                                    ></span>
                                                    <span className="text-[#CCD0CF]">{status.label}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === booking._id ? null : booking._id)}
                                                    className="text-[#CCD0CF]/60 hover:text-[#CCD0CF] cursor-pointer p-2"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openMenuId === booking._id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                        <div className="absolute right-0 top-[36px] bg-[#4A5C6A] rounded-[12px] overflow-hidden z-20 w-[180px] shadow-xl border border-[#253745]">
                                                            {booking.status === "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusChange(booking._id, "confirmed")}
                                                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#00C896] text-[13px] hover:bg-[#00C896]/20 cursor-pointer font-medium"
                                                                    >
                                                                        <FaCheck /> Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(booking._id, "rejected")}
                                                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 cursor-pointer font-medium"
                                                                    >
                                                                        <FaTimes /> Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {booking.status === "confirmed" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusChange(booking._id, "completed")}
                                                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#4A9CD6] text-[13px] hover:bg-[#4A9CD6]/10 cursor-pointer font-medium"
                                                                    >
                                                                        <FaCheck /> Mark Completed
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(booking._id, "cancelled")}
                                                                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 cursor-pointer font-medium"
                                                                    >
                                                                        <FaBan /> Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(booking.status === "rejected" || booking.status === "cancelled" || booking.status === "completed") && (
                                                                <p className="px-4 py-3 text-[#CCD0CF]/50 text-[12px]">No actions available</p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </ScrollFadeIn>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}