import { useState } from "react";
import Overview from "./Overview";
import Sidebar from "./SlideBar";
import TopBar from "../hotel_owner/TopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyVehicle from "./MyVehicle";

export default function TransportOwnerDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen overflow-x-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col md:ml-64 pt-[60px] md:pt-0 w-full min-w-0">
        <TopBar />

        <main className="flex-1 px-3 sm:px-6 md:px-8 py-6 sm:py-8 w-full max-w-[1400px] mx-auto">
          <section id="overview" className="scroll-mt-20 md:scroll-mt-8">
            <Overview />
          </section>

          <section id="my-vehicle" className="scroll-mt-20 md:scroll-mt-8 mt-12">
            <MyVehicle />
          </section>

          <section id="bookings" className="scroll-mt-20 md:scroll-mt-8 mt-12">
            <Bookings />
          </section>

          <section id="reviews" className="scroll-mt-20 md:scroll-mt-8 mt-12">
            <Reviews />
          </section>

          <section id="profile" className="scroll-mt-20 md:scroll-mt-8 mt-12">
            <Profile />
          </section>
        </main>
      </div>
    </div>
  );
}