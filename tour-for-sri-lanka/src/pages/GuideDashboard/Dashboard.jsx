import Overview from "./Overview";
import Sidebar from "./SlideBar";
import TopBar from "../hotel_owner/TopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyProfile from "./MyProfile";

export default function GuideDashboard(){
    return(
        <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen">
            <Sidebar/>
            <div className="flex-1 flex flex-col md:ml-64">
                <TopBar/>
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