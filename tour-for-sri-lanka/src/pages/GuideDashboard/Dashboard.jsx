import { useState } from "react";
import Overview from "./Overview";
import Sidebar from "./SlideBar";
import TopBar from "./TopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyProfile from "./MyProfile";

export default function GuideDashboard(){
    const [mobileOpen, setMobileOpen] = useState(false);

    return(
        <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen relative">
            {/* Sidebar with mobile props */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            
            {/* Overlay for mobile when sidebar is open */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex flex-col md:ml-64 w-full">
                <TopBar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 px-4 sm:px-6 md:px-8 py-8">
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