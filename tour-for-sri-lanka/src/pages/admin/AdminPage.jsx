import { useState } from "react";
import { MdDashboard, MdHotel, MdDirectionsCar, MdPerson, MdMenu, MdClose } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminHotels from "./AdminHotels";
import AdminTransport from "./AdminTransport";
import AdminGuides from "./AdminGuides";
import AdminTours from "./AdminTours";
import AdminCategories from "./AdminCategories";
import AdminCategoryDestinations from "./AdminCategoryDestinations";

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: MdDashboard, match: (p) => p === "/admin" },
    { path: "/admin/tours", label: "Tours", icon: MdDashboard, match: (p) => p.startsWith("/admin/tours") },
    { path: "/admin/hotels", label: "Hotels", icon: MdHotel, match: (p) => p.startsWith("/admin/hotels") },
    { path: "/admin/transport", label: "Transport", icon: MdDirectionsCar, match: (p) => p.startsWith("/admin/transport") },
    { path: "/admin/guides", label: "Guides", icon: MdPerson, match: (p) => p.startsWith("/admin/guides") },
    { path: "/admin/categories", label: "Categories", icon: MdDashboard, match: (p) => p.startsWith("/admin/categories") },
  ];

  function getLinkClass(isActive) {
    return `admin-nav-item-anim w-[220px] h-[45px] text-[15px] flex items-center rounded-[20px] relative transition-all duration-300 ${
      isActive
        ? "bg-[#00C896]/20 text-[#00C896]"
        : "text-[#CCD0CF] hover:bg-[#4A5C6A]"
    }`;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="modal-backdrop-anim fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`admin-sidebar-anim w-[260px] md:w-[300px] h-screen bg-[#253745] md:opacity-[80%] fixed md:absolute left-0 top-0 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <div className="h-[70px] md:h-[80px] flex items-center justify-between px-6">
            <span className="text-[#00C896] font-bold text-lg">Admin</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#CCD0CF] text-2xl active:scale-90 transition-transform duration-150"
            >
              <MdClose />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 mt-[30px]">
            {navItems.map((item) => {
              const isActive = item.match(location.pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={getLinkClass(isActive)}
                >
                  <Icon className="absolute left-5 text-xl text-[#00C896]" />
                  <span className="font-medium ml-12">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-[#4A5C6A]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 active:scale-95 font-medium transition-all duration-200 w-full px-4"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Top Navbar */}
      <div className="admin-navbar-anim md:ml-[300px] h-[70px] md:h-[80px] bg-[#253745] opacity-[80%] flex items-center gap-3 px-4 md:px-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-[#CCD0CF] text-2xl active:scale-90 transition-transform duration-150"
        >
          <MdMenu />
        </button>
        <span className="text-[#CCD0CF] text-base md:text-[20px] font-bold truncate">
          Dashboard Overview
        </span>
      </div>

      {/* Main Content */}
      <div className="admin-content-anim md:ml-[300px] w-full md:w-[calc(100vw-300px)] h-[calc(100vh-70px)] md:h-[calc(100vh-80px)] p-4 md:p-8 overflow-y-auto">
        <Routes path="/*">
          <Route path="/tours" element={<AdminTours />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/categories/:categoryId" element={<AdminCategoryDestinations />} />
          <Route path="/hotels" element={<AdminHotels />} />
          <Route path="/transport" element={<AdminTransport />} />
          <Route path="/guides" element={<AdminGuides />} />
        </Routes>
      </div>
    </div>
  );
}