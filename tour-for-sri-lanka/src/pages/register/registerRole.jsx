import { FaUser, FaCar, FaHotel } from "react-icons/fa6";
import { RiUserLocationFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    role: "traveler",
    path: "/traveler-register",
    icon: FaUser,
    title: "Traveler",
    desc: "Plan your trips easily and explore Sri Lanka",
  },
  {
    role: "vehicle_owner",
    path: "/vehicle-register",
    icon: FaCar,
    title: "Vehicle Owner",
    desc: "Provide transport services and earn more",
  },
  {
    role: "guide",
    path: "/guide-register",
    icon: RiUserLocationFill,
    title: "Guide",
    desc: "Guide travelers around Sri Lanka",
  },
  {
    role: "hotel_owner",
    path: "/hotel-register",
    icon: FaHotel,
    title: "Hotel Owner",
    desc: "List your hotel and rooms",
  },
]

export default function RegisterRole() {
  const navigate = useNavigate()

  const handleSelect = (role, path) => {
    sessionStorage.setItem("role", role)
    navigate(path)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex justify-center items-center relative">
      <div className="absolute left-[80px]">
        <img src="/main_logo.png" alt="main_logo" />
      </div>

      <div className="w-[500px] h-[500px] absolute right-[10%] flex flex-col items-center">
        <h1 className="text-[25px] mt-[20px] font-bold text-text">Sign up as</h1>
        <span className="text-text text-[12px]">Choose how you want to join with us</span>

        <div className="w-[350px] grid grid-cols-2 gap-x-[50px] gap-y-[10px] mt-[20px]">
          {ROLES.map(({ role, path, icon: Icon, title, desc }) => (
            <div
              key={role}
              onClick={() => handleSelect(role, path)}
              className="w-[150px] h-[170px] cursor-pointer bg-border/30 rounded-[20px] drop-shadow-black flex flex-col items-center hover:scale-105 transition-all duration-300"
            >
              <Icon className="w-[40px] h-[40px] text-primary-green mt-[30px]" />
              <h1 className="text-[15px] font-bold text-text mt-[10px]">{title}</h1>
              <span className="text-text text-[12px] text-center p-[5px]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}