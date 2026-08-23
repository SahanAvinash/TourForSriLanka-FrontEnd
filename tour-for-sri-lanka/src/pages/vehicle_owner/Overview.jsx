import { useEffect, useState } from "react";
import { FaCalendarCheck, FaStar, FaMoneyBillWave, FaClipboardList, FaCheckCircle } from "react-icons/fa"
import { MdVerified, MdPending } from "react-icons/md";
import axios from "axios";

export default function Overview(){
    const [loadingStats, setLoadingStats] = useState(true)
    const [ownerName, setOwnerName] = useState("")
    const [isApproved, setIsApproved] = useState(false)

    const [todayBookings, setTodayBookings] = useState(0)
    const [pendingBookings, setPendingBookings] = useState(0)
    const [totalBookings, setTotalBookings] = useState(0)
    const [completedTrips, setCompletedTrips] = useState(0)
    const [totalEarnings, setTotalEarnings] = useState(0)

    const [averageRating, setAverageRating] = useState(0)
    const [reviewCount, setReviewCount] = useState(0)

    const today = new Date().toLocaleDateString("en-US",{
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
        if(!storedUser) return

        const user = JSON.parse(storedUser)
        const transportId = user._id

        setOwnerName(user.firstName || "")

        axios.get(`http://localhost:3000/api/transport/${transportId}`)
            .then((res) => {
                setIsApproved(res.data.isApproved || false)
            }).catch((error) => {
                console.log(error)
            })

        axios.get(`http://localhost:3000/api/booking/transport/${transportId}`)
            .then((res) => {
                const bookings = res.data
                const todayStr = new Date().toDateString()

                setTodayBookings(bookings.filter(b => new Date(b.pickupDate).toDateString() === todayStr).length)
                setPendingBookings(bookings.filter(b => b.status === "pending").length)
                setTotalBookings(bookings.length)
                setCompletedTrips(bookings.filter(b => b.status === "completed").length)
                setTotalEarnings(
                    bookings
                        .filter(b => b.status === "completed")
                        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                )
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoadingStats(false)
            })

        axios.get(`http://localhost:3000/api/transport-review/vehicle/${transportId}`)
            .then((res) => {
                const reviews = res.data
                if (reviews.length > 0) {
                    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    setAverageRating(avg)
                    setReviewCount(reviews.length)
                }
            }).catch((error) => {
                console.log(error)
            })
    },[])
    return(
        <section id="overview">
            {!isApproved && !loadingStats && (
                <div className="vehicle-owner-alert-anim bg-[#4A5C6A]/30 border border-[#CD2F31]/40 rounded-[20px] px-6 py-4 mb-6 flex items-center gap-3">
                    <MdPending className="text-[#00C896] text-[22px] flex-shrink-0"/>
                    <div>
                        <p className="text-[#CCD0CF] text-[14px] font-semibold">Verification Pending</p>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Your account is under review. Some features may be limited until approval.</p>
                    </div>
                </div>
            )}

            <div className="vehicle-owner-header-anim flex justify-between items-center mb-1">
                <h1 className="text-[#CCD0CF] text-[24px] font-bold">Overview</h1>
                <span className="text-[#CCD0CF]/60 text-[16px]">{today}</span>
            </div>
            <div className="vehicle-owner-header-anim flex">
                <p className="text-[#CCD0CF] text-[14px] mb-6">{ownerName}</p>
                {isApproved && (
                    <MdVerified className="text-[#00C896]/80 ml-[10px] text-[20px]"/>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-[20px]">
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaClipboardList/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Total Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : totalBookings}
                        </p>
                    </div>
                </div>
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaMoneyBillWave/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Total Earnings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : `Rs. ${totalEarnings.toLocaleString()}`}
                        </p>
                    </div>
                </div>
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaCalendarCheck/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Today Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : todayBookings}
                        </p>
                    </div>
                </div>
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <MdPending/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Pending Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : pendingBookings}
                        </p>
                    </div>
                </div>
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaCheckCircle/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Completed Trips</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : completedTrips}
                        </p>
                    </div>
                </div>
                <div className="vehicle-owner-card-anim bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaStar/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Average Rating</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats
                                ? "..."
                                : reviewCount > 0
                                    ? <>{averageRating.toFixed(1)}<span className="text-[#FFC107]">★</span></>
                                    : "No reviews yet"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}