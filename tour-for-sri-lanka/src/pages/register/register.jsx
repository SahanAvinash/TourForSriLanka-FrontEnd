import { FaUser } from "react-icons/fa6";
import { FaCar } from "react-icons/fa";
import { RiUserLocationFill } from "react-icons/ri";
import { FaHotel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


export default function Register(){
    
    const navigate =useNavigate()

    return(
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>
            <div className="w-[500px] h-[500px] absolute right-[10%] flex flex-col items-center">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as</h1>
                <span className="text-[#CCD0CF] text-[12px]">Choose how you want to join with us</span>
                <div className="w-[350px] h-[390px] mt-[20px] flex justify-between">
                    <div onClick={() => {   
                        sessionStorage.setItem("role", "traveler")
                        navigate("/traveler-register")
                    }
                    } className="w-[150px] h-[170px] cursor-pointer bg-[#4A5C6A]/30 rounded-[20px] drop-shadow-black flex-col flex items-center hover:scale-105 transition-all duration-300">
                        <FaUser className="w-[40px] h-[40px] object-fit text-[#00C896]/80 mt-[30px]"/>
                        <h1 className="text-[15px] font-bold text-[#CCD0CF] mt-[10px]">Traveler</h1>
                        <span className="text-[#CCD0CF] text-[12px] text-center p-[5px]">Plane your trips easily and explore Sri Lanka</span>
                    </div>
                    <div onClick={()=> {
                        sessionStorage.setItem("role", "vehicle_owner")
                        navigate("/vehicle-register")
                    }} className="w-[150px] h-[170px] bg-[#4A5C6A]/30 cursor-pointer rounded-[20px] drop-shadow-black flex-col flex items-center hover:scale-105 transition-all duration-300">
                        <FaCar className="w-[40px] h-[40px] object-fit text-[#00C896]/80 mt-[30px]"/>
                        <h1 className="text-[15px] font-bold text-[#CCD0CF] mt-[10px]">Vehicle Owner</h1>
                        <span className="text-[#CCD0CF] text-[12px] text-center p-[5px]">Provide transport services and earn more</span>
                    </div>
                </div>
                <div className="w-[350px] h-[390px] flex justify-between">
                    <div onClick={()=> {
                        sessionStorage.setItem("role", "guide")
                        navigate("/guide-register")
                    }} className="w-[150px] h-[170px] cursor-pointer bg-[#4A5C6A]/30 rounded-[20px] drop-shadow-black flex-col flex items-center hover:scale-105 transition-all duration-300">
                        <RiUserLocationFill className="w-[40px] h-[40px] object-fit text-[#00C896]/80 mt-[30px]"/>
                        <h1 className="text-[15px] font-bold text-[#CCD0CF] mt-[10px]">Guide</h1>
                        <span className="text-[#CCD0CF] text-[12px] text-center p-[5px]">Guide travelers around Sri Lanka</span>
                    </div>
                    <div onClick={()=> {
                        sessionStorage.setItem("role", "hotel_owner")
                        navigate("/hotel-register")
                    }} className="w-[150px] h-[170px] cursor-pointer bg-[#4A5C6A]/30 rounded-[20px] drop-shadow-black flex-col flex items-center hover:scale-105 transition-all duration-300">
                        <FaHotel className="w-[40px] h-[40px] object-fit text-[#00C896]/80 mt-[30px]"/>
                        <h1 className="text-[15px] font-bold text-[#CCD0CF] mt-[10px]">Hotel Owner</h1>
                        <span className="text-[#CCD0CF] text-[12px] text-center p-[5px]">List your hotel and rooms</span>
                    </div>
                </div>
            </div>         
        </div>
    )
}