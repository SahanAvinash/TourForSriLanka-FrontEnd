import Overview from "./overview";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function HotelOwnerDashboard(){
    return(
        <div className="flex bg-[#06141B] min-h-screen">
            <Sidebar/>
            <div className="flex-1 flex flex-col">
                <TopBar/>
                <main className="flex-1 px-8 py-8">
                    <Overview/>
                </main>
            </div>
        </div>
    )
}