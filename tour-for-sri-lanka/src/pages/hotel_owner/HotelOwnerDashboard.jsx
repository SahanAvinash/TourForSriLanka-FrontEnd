import { useState } from "react";
import Overview from "./overview";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RoomManagement from "./RoomManagement";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";

export default function HotelOwnerDashboard() {
    const [activeSection, setActiveSection] =
        useState("overview");

    return (
        <div className="flex flex-col md:flex-row bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen overflow-x-hidden">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64 pt-[60px] md:pt-0">
                <TopBar />

                <main className="flex-1 w-full py-6 md:py-8">
                    <Overview />

                    <RoomManagement />

                    <Bookings />

                    <Reviews />

                    <Profile />
                </main>
            </div>
        </div>
    );
}