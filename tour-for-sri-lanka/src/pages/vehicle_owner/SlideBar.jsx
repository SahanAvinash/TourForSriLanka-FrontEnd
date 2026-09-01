import {
  FaHome,
  FaCar,
  FaStar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { SiBookingdotcom } from "react-icons/si";
import { MdMenu, MdClose } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export const vehicleOwnerMenu = [
  {
    name: "Overview",
    icon: <FaHome />,
    id: "overview",
  },
  {
    name: "My Vehicle",
    icon: <FaCar />,
    id: "my-vehicle",
  },
  {
    name: "Bookings",
    icon: <SiBookingdotcom />,
    id: "bookings",
  },
  {
    name: "Reviews",
    icon: <FaStar />,
    id: "reviews",
  },
  {
    name: "Profile",
    icon: <FaCog />,
    id: "profile",
  },
];

export default function Sidebar({
  activeSection,
  setActiveSection,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [setActiveSection]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      const offset = window.innerWidth < 768 ? 80 : 20;

      const sectionTop =
        section.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }

    setActiveSection(id);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full h-[60px] bg-[#253745] flex items-center px-4 z-30 border-b border-[#4A5C6A]/40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-[#CCD0CF] text-[28px] active:scale-90 transition-transform duration-150"
          aria-label="Open menu"
        >
          <MdMenu />
        </button>

        <img
          src={logo}
          alt="logo"
          className="h-8 w-auto object-contain ml-4"
        />
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`w-64 bg-[#253745] h-screen fixed top-0 left-0 flex flex-col overflow-y-auto z-50
        transition-transform duration-300 ease-in-out
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        md:translate-x-0`}
      >
        <div className="h-[60px] md:h-auto md:py-8 flex items-center justify-center relative border-b border-[#4A5C6A]/40 md:border-0">
          <img
            src={logo}
            alt="logo"
            className="w-28 md:w-36 object-contain"
          />

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute right-4 text-[#CCD0CF] text-[26px] active:scale-90 transition-transform duration-150"
            aria-label="Close menu"
          >
            <MdClose />
          </button>
        </div>

        <nav className="flex-1 px-4 sm:px-5 pt-5 md:pt-0">
          {vehicleOwnerMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl mb-3 transition-all duration-300 ${
                activeSection === item.id
                  ? "bg-[#00C896] text-white"
                  : "text-gray-300 hover:bg-[#2F4156]"
              }`}
            >
              <span className="text-[18px] flex-shrink-0">
                {item.icon}
              </span>

              <span className="text-sm sm:text-base">
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-[#4A5C6A]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}