import { Link } from "react-router-dom"

export default function Header(){
    return(
        <header className="w-full h-[80px] shadow-xl flex justify-center items-center bg-[#06141B] relative">
            <img src="/main_logo.png" alt="main_logo.png" className="w-[103px] h-[45px] object-cover absolute left-[20px]"/>
            <Link to="/home" className="text-[18px] m-[20px] text-[#CCD0CF]">Home</Link>
            <Link to="/hotels" className="text-[18px] m-[20px] text-[#CCD0CF]">Hotels</Link>
            <Link to="/transport" className="text-[18px] m-[20px] text-[#CCD0CF]">Transport</Link>
            <Link to="/tours" className="text-[18px] m-[20px] text-[#CCD0CF]">Tours</Link>
            <Link to="/guides" className="text-[18px] m-[20px] text-[#CCD0CF]">Guides</Link>
            <Link to="/aboutus" className="text-[18px] m-[20px] text-[#CCD0CF]">About us</Link>
            <Link to="/contactus" className="text-[18px] m-[20px] text-[#CCD0CF]">Contact us</Link>
        </header>
    )
}