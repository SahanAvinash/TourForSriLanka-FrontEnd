import { useState } from "react";
import Overview from "./overview";
import Sidebar, { hotelOwnerMenu } from "./Sidebar";
import TopBar from "./TopBar";
import RoomManagement from "./RoomManagement";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";

export default function HotelOwnerDashboard() {
    const [activeSection, setActiveSection] = useState("overview");

    const activeMenuItem =
        hotelOwnerMenu.find((item) => item.id === activeSection) ||
        hotelOwnerMenu[0];

    return (
        <div className="flex flex-col md:flex-row bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen overflow-x-hidden">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                <TopBar />

                <main className="flex-1 w-full px-3 sm:px-5 md:px-8 pt-[76px] md:pt-8 pb-8">
                    <div className="w-full flex justify-center mb-6 md:mb-8">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-[#00C896] text-xl sm:text-2xl flex-shrink-0">
                                {activeMenuItem.icon}
                            </span>

                            <h1 className="text-[#CCD0CF] text-xl sm:text-2xl font-bold text-center">
                                {activeMenuItem.name}
                            </h1>
                        </div>
                    </div>

                    <div className="w-full">
                        <Overview />
                        <RoomManagement />
                        <Bookings />
                        <Reviews />
                        <Profile />
                    </div>
                </main>
            </div>
        </div>
    );
}
