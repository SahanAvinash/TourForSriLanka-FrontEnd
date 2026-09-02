import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { FaCalendarCheck, FaStar, FaMoneyBillWave, FaClipboardList, FaCheckCircle } from "react-icons/fa"
import { MdPending } from "react-icons/md";
import axios from "axios";

export default function Overview(){
    const [loadingStats, setLoadingStats] = useState(true)
    const [guideName, setGuideName] = useState("")

    const [todayBookings, setTodayBookings] = useState(0)
    const [pendingBookings, setPendingBookings] = useState(0)
    const [totalBookings, setTotalBookings] = useState(0)
    const [completedTours, setCompletedTours] = useState(0)
    const [totalEarnings, setTotalEarnings] = useState(0)

    const today = new Date().toLocaleDateString("en-US",{
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    })

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
        if(!storedUser) return

        const user = JSON.parse(storedUser)
        const guideId = user._id

        setGuideName(user.firstName || "")

        axios.get(`${API_BASE_URL}/api/booking/guide/${guideId}`)
            .then((res) => {
                const bookings = res.data
                const todayStr = new Date().toDateString()

                setTodayBookings(bookings.filter(b => new Date(b.tourDate).toDateString() === todayStr).length)
                setPendingBookings(bookings.filter(b => b.status === "pending").length)
                setTotalBookings(bookings.length)
                setCompletedTours(bookings.filter(b => b.status === "completed").length)
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
    },[])

    return(
        <section id="overview">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                <h1 className="text-[#CCD0CF] text-[24px] font-bold">Overview</h1>
                <span className="text-[#CCD0CF]/60 text-[14px] sm:text-[16px]">{today}</span>
            </div>
            <p className="text-[#CCD0CF] text-[14px] mb-6">{guideName}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-[20px]">
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <FaClipboardList/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Total Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">{loadingStats? "..." : totalBookings}</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <FaMoneyBillWave/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Total Earnings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">{loadingStats? "..." : `Rs. ${totalEarnings.toLocaleString()}`}</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <FaCalendarCheck/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Today Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">{loadingStats? "..." : todayBookings}</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <MdPending/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Pending Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">{loadingStats? "..." : pendingBookings}</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <FaCheckCircle/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Completed Tours</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">{loadingStats? "..." : completedTours}</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px] flex-shrink-0">
                        <FaStar/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Average Rating</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">Soon</p>
                    </div>
                </div>
            </div>
        </section>
    )
}