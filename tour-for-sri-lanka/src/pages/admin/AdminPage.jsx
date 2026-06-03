import { MdDashboard } from "react-icons/md";
import { Link, Route, Routes} from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745]">

      {/* Sidebar */}
      <div className="w-[300px] h-screen bg-[#253745] opacity-[80%] absolute left-0 top-0">
        
        <div className="h-[80px] flex items-center justify-center">
            
        </div>

        <div className="flex flex-col items-center gap-4 mt-[30px]">

          <Link to="/admin" className="w-[200px] h-[40px] text-[#CCD0CF] text-[15px] flex bg-[#4A5C6A] items-center justify-center rounded-[15px] relative">
            
            <MdDashboard className="text-[#00C896] absolute left-5 text-[20px]" />
            
            <span className="text-[15px] font-bold">
              Dashboard
            </span>
        
          </Link>

          <Link to="/admin/bookings" className="w-[220px] h-[45px] text-[#CCD0CF] text-[15px] flex items-center justify-center rounded-xl relative hover:bg-[#4A5C6A] transition-all duration-300">

            <MdDashboard className="text-[#00C896] absolute left-5 text-xl" />

            <span className="font-medium">
              Bookings
            </span>

          </Link>

        </div>
      </div>

      {/* Top Navbar */}
      <div className="ml-[300px] h-[80px] bg-[#253745] opacity-[80%] flex items-center px-8">

        <span className="text-[#CCD0CF] text-[20px] font-bold">
          Dashboard Overview
        </span>

      </div>
      
      {/* Main Content */}
      <div className="ml-[300px] w-[calc(100vw-300px)] h-[calc(100vh-80px)] p-8">
        <Routes path="/*">
            <Route path="/bookings" element={<h1>Booking</h1>}></Route>
        </Routes>
      </div>

    </div>
  );
}