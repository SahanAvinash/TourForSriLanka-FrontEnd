import { MdDashboard, MdHotel, MdDirectionsCar, MdPerson } from "react-icons/md";
import { Link, Route, Routes } from "react-router-dom";
import AdminHotels from "./AdminHotels";
import AdminTransport from "./AdminTransport";
import AdminGuides from "./AdminGuides";
import AdminTours from "./AdminTours";
import AdminCategories from "./AdminCategories";
import AdminCategoryDestinations from "./AdminCategoryDestinations";

export default function AdminPage() {
  const linkClass =
    "w-[220px] h-[45px] text-[#CCD0CF] text-[15px] flex items-center rounded-xl relative hover:bg-[#4A5C6A] transition-all duration-300";

  return (
    <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745]">
      {/* Sidebar */}
      <div className="w-[300px] h-screen bg-[#253745] opacity-[80%] absolute left-0 top-0">
        <div className="h-[80px] flex items-center justify-center"></div>

        <div className="flex flex-col items-center gap-4 mt-[30px]">
          <Link to="/admin" className={linkClass}>
            <MdDashboard className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Dashboard</span>
          </Link>

          <Link to="/admin/tours" className={linkClass}>
            <MdDashboard className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Tours</span>
          </Link>

          <Link to="/admin/categories" className={linkClass}>
            <MdDashboard className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Categories</span>
          </Link>

          <Link to="/admin/hotels" className={linkClass}>
            <MdHotel className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Hotels</span>
          </Link>

          <Link to="/admin/transport" className={linkClass}>
            <MdDirectionsCar className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Transport</span>
          </Link>

          <Link to="/admin/guides" className={linkClass}>
            <MdPerson className="text-[#00C896] absolute left-5 text-xl" />
            <span className="font-medium ml-12">Guides</span>
          </Link>
        </div>
      </div>

      {/* Top Navbar */}
      <div className="ml-[300px] h-[80px] bg-[#253745] opacity-[80%] flex items-center px-8">
        <span className="text-[#CCD0CF] text-[20px] font-bold">Dashboard Overview</span>
      </div>

      {/* Main Content */}
      <div className="ml-[300px] w-[calc(100vw-300px)] h-[calc(100vh-80px)] p-8 overflow-y-auto">
        <Routes path="/*">
          <Route path="/tours" element={<AdminTours/>}></Route>
          <Route path="/categories" element={<AdminCategories />}></Route>
          <Route path="/categories/:categoryId" element={<AdminCategoryDestinations />}></Route>
          <Route path="/bookings" element={<h1>Booking</h1>}></Route>
          <Route path="/hotels" element={<AdminHotels />}></Route>
          <Route path="/transport" element={<AdminTransport />}></Route>
          <Route path="/guides" element={<AdminGuides />}></Route>
        </Routes>
      </div>
    </div>
  );
}