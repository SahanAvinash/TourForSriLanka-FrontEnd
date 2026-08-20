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
    <div className="w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex flex-col md:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-24 px-4 sm:px-6 py-10 md:py-12">

        <img
            src="/main_logo.png"
            alt="main_logo"
            className="login-logo-anim w-[100px] xs:w-[120px] sm:w-[150px] md:w-[220px] lg:w-[360px] xl:w-[480px] 2xl:w-[600px] shrink-0 transition-transform duration-300"
        />

      <div className="w-full max-w-[420px] flex flex-col items-center">
        <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] mt-[10px] md:mt-[20px] font-bold text-text text-center">
          Sign up as
        </h1>
        <span className="text-text text-[12px] text-center">
          Choose how you want to join with us
        </span>

        <div className="w-full grid grid-cols-2 gap-x-4 xs:gap-x-6 sm:gap-x-[50px] gap-y-4 sm:gap-y-[10px] mt-[20px]">
          {ROLES.map(({ role, path, icon: Icon, title, desc }) => (
            <div
              key={role}
              onClick={() => handleSelect(role, path)}
              className="w-full min-w-0 py-4 sm:py-0 sm:aspect-[150/170] cursor-pointer bg-border/30 rounded-[20px] drop-shadow-black flex flex-col items-center hover:scale-105 transition-all duration-300 px-2"
            >
              <Icon className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] text-primary-green mt-0 sm:mt-[30px] shrink-0" />
              <h1 className="w-full text-[13px] sm:text-[15px] font-bold text-text mt-[8px] sm:mt-[10px] text-center">{title}</h1>
              <span className="w-full text-text text-[11px] sm:text-[12px] text-center p-[5px]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}