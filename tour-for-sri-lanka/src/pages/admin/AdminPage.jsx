import { MdDashboard, MdHotel, MdDirectionsCar, MdPerson } from "react-icons/md";
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

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: MdDashboard, match: (p) => p === "/admin" },
    { path: "/admin/tours", label: "Tours", icon: MdDashboard, match: (p) => p.startsWith("/admin/tours") },
    { path: "/admin/hotels", label: "Hotels", icon: MdHotel, match: (p) => p.startsWith("/admin/hotels") },
    { path: "/admin/transport", label: "Transport", icon: MdDirectionsCar, match: (p) => p.startsWith("/admin/transport") },
    { path: "/admin/guides", label: "Guides", icon: MdPerson, match: (p) => p.startsWith("/admin/guides") },
    { path: "/admin/categories", label: "Categories", icon: MdDashboard, match: (p) => p.startsWith("/admin/categories") },
  ];

  function getLinkClass(isActive) {
    return `w-[220px] h-[45px] text-[15px] flex items-center rounded-[20px] relative transition-all duration-300 ${
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
    <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745]">
      {/* Sidebar */}
      <div className="w-[300px] h-screen bg-[#253745] opacity-[80%] absolute left-0 top-0 flex flex-col justify-between">
        <div>
          <div className="h-[80px] flex items-center justify-center"></div>

          <div className="flex flex-col items-center gap-4 mt-[30px]">
            {navItems.map((item) => {
              const isActive = item.match(location.pathname);
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className={getLinkClass(isActive)}>
                  <Icon
                    className={`absolute left-5 text-xl ${isActive ? "text-[#00C896]" : "text-[#00C896]"}`}
                  />
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
            className="flex items-center gap-3 text-red-400 hover:text-red-300 font-medium transition-colors w-full px-4"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Top Navbar */}
      <div className="ml-[300px] h-[80px] bg-[#253745] opacity-[80%] flex items-center px-8">
        <span className="text-[#CCD0CF] text-[20px] font-bold">Dashboard Overview</span>
      </div>

      {/* Main Content */}
      <div className="ml-[300px] w-[calc(100vw-300px)] h-[calc(100vh-80px)] p-8 overflow-y-auto">
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