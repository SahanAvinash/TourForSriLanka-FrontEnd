import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function HotelOwnerDashboard(){
    return(
        <div className="flex">
            <Sidebar/>
            <TopBar/>
        </div>
    )
}