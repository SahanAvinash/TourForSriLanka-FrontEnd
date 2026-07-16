import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/hotels" },
    { name: "Transport", path: "/transport" },
    { name: "Tours", path: "/tours" },
    { name: "Guides", path: "/guides" },
    { name: "About", path: "/about-us" },
    { name: "Contact", path: "/contact-us" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#253745]/95 backdrop-blur-md border-b border-white/10 shadow-md">
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

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;