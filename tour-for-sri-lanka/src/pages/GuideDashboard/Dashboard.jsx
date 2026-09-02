import { useState, useEffect } from "react";
import Overview from "./Overview";
import Sidebar from "./SlideBar";
import GuideTopBar from "./GuideTopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyProfile from "./MyProfile";
import axios from "axios";

export default function GuideDashboard(){
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isApproved, setIsApproved] = useState(true); // default true kiyala thiyamu load wenakan

    useEffect(() => {
        // Local storage eken hari token eken hari guide ge id eka aran status eka check karanna
        const fetchGuideStatus = async () => {
            try {
                // Token eka hari user object eka hari storage eke save wela thiyena widiha ananuwa id eka ganna
                const userData = JSON.parse(localStorage.getItem("user"));
                if (userData && userData._id) {
                    const res = await axios.get(`http://localhost:5000/api/guides/${userData._id}`);
                    setIsApproved(res.data.isApproved);
                }
            } catch (error) {
                console.log("Failed to fetch guide approval status", error);
            }
        };

        fetchGuideStatus();
    }, []);

    return(
        <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen relative">
            {/* Sidebar */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex flex-col md:ml-64 w-full">
                <GuideTopBar onMenuClick={() => setMobileOpen(true)} />
                
                {/* Pending Approval Banner - isApproved false nam witharai penne */}
                {!isApproved && (
                    <div className="mx-4 sm:mx-6 md:mx-8 mt-6 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-r-xl shadow-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base sm:text-lg">⚠️ Account Pending Admin Approval</h3>
                            <p className="text-xs sm:text-sm text-yellow-300/80 mt-1">
                                You have updated your profile or pricing details. Your account is currently pending admin review and will not be visible to travelers until approved.
                            </p>
                        </div>
                    </div>
                )}

                <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
                    <Overview/>
                    <MyProfile/>
                    <Bookings/>
                    <Reviews/>
                    <Profile/>
                </main>
            </div>
        </div>
    )
}