import {
  FaHome,
  FaUser,
  FaHotel,
  FaBed,
  FaStar,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useEffect, useState } from "react";

import logo from "../../assets/logo.png"

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const menu = [
    {
      name: "Overview",
      icon: <FaHome />,
      id: "overview",
    },
    {
      name: "Room Management",
      icon: <FaBed />,
      id: "rooms",
    },
    {
      name: "Profile",
      icon: <FaUser />,
      id: "profile",
    },
    {
      name: "Hotel Information",
      icon: <FaHotel />,
      id: "hotel-information",
    },
    {
      name: "Reviews",
      icon: <FaStar />,
      id: "reviews",
    },
    {
      name: "Messages",
      icon: <FaEnvelope />,
      id: "messages",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      id: "settings",
    },
  ];

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.35,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <aside className="w-64 bg-[#253745] min-h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="py-8 flex justify-center">
        <img src={logo} alt="logo" className="w-36" />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-5">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl mb-3 transition-all duration-300
            ${
              activeSection === item.id
                ? "bg-[#00C896] text-white"
                : "text-gray-300 hover:bg-[#2F4156]"
            }`}
          >
            {item.icon}

            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-[#4A5C6A]">
        <button className="flex items-center gap-3 text-red-400 hover:text-red-300">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}