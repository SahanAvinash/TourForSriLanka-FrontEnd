import { useEffect, useState } from "react";
import {FaBed, FaCalendarCheck, FaStar } from "react-icons/fa"
import { GrVmMaintenance } from "react-icons/gr";
import { MdVerified } from "react-icons/md";
import { MdEventAvailable } from "react-icons/md";
import { MdPending } from "react-icons/md";
import axios from "axios";

export default function Overview(){
    const [roomCount, setRoomCount] = useState(0)
    const [loadingStats, setLoadingStats] = useState(true)
    const [hotelName, setHotelName] = useState("")
    const [isApproved, setIsApproved] = useState(false)

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
        const hotelId = user._id

        setHotelName(user.hotelName || "")
        setIsApproved(user.isApproved || false)
        console.log("isApproved value:", user.isApproved)

        axios.get(`http://localhost:3000/api/addRoom/hotel/${hotelId}`)
            .then((res) => {
                setRoomCount(res.data.length)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoadingStats(false)
            })
    },[])
    return(
        <section id="overview">
            {!isApproved && !loadingStats && (
                <div className="bg-[#4A5C6A]/30 border border-[#CD2F31]/40 rounded-[20px] px-6 py-4 mb-6 flex items-center gap-3">
                    <MdPending className="text-[#00C896] text-[22px] flex-shrink-0"/>
                    <div>
                        <p className="text-[#CCD0CF] text-[14px] font-semibold">Verification Pending</p>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Your hotel is under review. Some features may be limited until approval.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-1">
                <h1 className="text-[#CCD0CF] text-[24px] font-bold">Overview</h1>
                <span className="text-[#CCD0CF]/60 text-[16px]">{today}</span>
            </div>
            <div className="flex">
                <p className="text-[#CCD0CF] text-[14px] mb-6">{hotelName}</p>
                {isApproved && (
                    <MdVerified className="text-[#00C896]/80 ml-[10px] text-[20px]"/>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-[20px]">
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaBed/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Total Rooms</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">
                            {loadingStats? "..." : roomCount}
                        </p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <MdEventAvailable/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Available Rooms</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">Soon</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <FaCalendarCheck/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Today Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">Soon</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <MdPending/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Pending Bookings</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">Soon</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
                        <GrVmMaintenance/>
                    </div>
                    <div>
                        <p className="text-[#CCD0CF]/60 text-[12px]">Maintance Rooms</p>
                        <p className="text-[#CCD0CF] text-[22px] font-bold">Soon</p>
                    </div>
                </div>
                <div className="bg-[#253745] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-[22px]">
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