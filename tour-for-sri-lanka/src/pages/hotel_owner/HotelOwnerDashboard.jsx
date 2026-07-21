import Overview from "./overview";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RoomManagement from "./RoomManagement";
import Bookings from "./Bookings";

export default function HotelOwnerDashboard(){
    return(
        <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen">
            <Sidebar/>
            <div className="flex-1 flex flex-col ml-64">
                <TopBar/>
                <main className="flex-1 px-8 py-8">
                    <Overview/>
                    <RoomManagement/>
                    <Bookings/>
                </main>
            </div>
        </div>
    )
}