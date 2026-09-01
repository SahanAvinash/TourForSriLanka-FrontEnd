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
    <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col md:ml-64 pt-[60px] md:pt-0">
        <TopBar />

        <main className="flex-1 px-4 sm:px-8 py-8">
          <section id="overview">
            <Overview />
          </section>

          <section id="my-vehicle">
            <MyVehicle />
          </section>

          <section id="bookings">
            <Bookings />
          </section>

          <section id="reviews">
            <Reviews />
          </section>

          <section id="profile">
            <Profile />
          </section>
        </main>
      </div>
    </div>
  );
}