import Overview from "./Overview";
import Sidebar from "./SlideBar";
import TopBar from "../hotel_owner/TopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyVehicle from "./MyVehicle";

export default function TransportOwnerDashboard(){
    return(
        <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen">
            <Sidebar/>
            <div className="flex-1 flex flex-col ml-64">
                <TopBar/>
                <main className="flex-1 px-8 py-8">
                    <Overview/>
                    <MyVehicle/>
                    <Bookings/>
                    <Reviews/>
                    <Profile/>
                </main>
            </div>
        </div>
    )
}