import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX, HiUserCircle } from "react-icons/hi";
import logo from "../assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const menuItems = [
    { name: "Home", path: "/"},
    { name: "Hotels", path: "/hotels" },
    { name: "Transport", path: "/transport" },
    { name: "Tours", path: "/tours" },
    { name: "Guides", path: "/guides" },
    { name: "About", path: "/about-us" },
    { name: "Contact", path: "/contact-us" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return (
        location.pathname === "/" ||
        location.pathname.startsWith("/destinations")
      )
    }
    if(path === "/hotels"){
      return (
        location.pathname.startsWith("/hotels") ||
        location.pathname.startsWith("/hotel/")
      )
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#253745]/95 backdrop-blur-md border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-10 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              alt="Tours For Sri Lanka"
              className="h-16 object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[15px] transition-all duration-300 pb-1
                  ${
                    isActive(item.path)
                      ? "text-[#00C896] border-b-2 border-[#00C896] font-semibold"
                      : "text-white hover:text-[#00C896]"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons / Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-white hover:text-[#00C896] transition duration-300"
                >
                  <HiUserCircle className="text-3xl" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-[#253745] border border-white/10 rounded-xl shadow-lg overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 text-[14px] text-white hover:bg-[#00C896]/10 hover:text-[#00C896] transition"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-[14px] text-white hover:bg-[#00C896]/10 hover:text-[#00C896] transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-[#00C896] text-white text-[12px] hover:bg-[#00C896] transition duration-300"
                >
                  Sign In
                </Link>

                <Link
                  to="/register-role"
                  className="px-5 py-2 rounded-full bg-[#00C896] text-white text-[12px] hover:bg-[#00b884] transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white text-3xl"
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#253745] border-t border-white/10">
          <div className="flex flex-col px-6 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`py-3 transition
                  ${
                    isActive(item.path)
                      ? "text-[#00C896] font-semibold"
                      : "text-white hover:text-[#00C896]"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col gap-3 mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-white">
                  <HiUserCircle className="text-3xl" />
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 border border-[#00C896] rounded-full text-white hover:bg-[#00C896] transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-center py-2 rounded-full bg-[#00C896] text-white hover:bg-[#00b884] transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-5">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 border border-[#00C896] rounded-full text-white hover:bg-[#00C896] transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/register-role"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 rounded-full bg-[#00C896] text-white hover:bg-[#00b884] transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;