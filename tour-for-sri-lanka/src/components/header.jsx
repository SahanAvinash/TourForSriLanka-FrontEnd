import { Link } from "react-router-dom"

export default function Header(){
    return(
        <header className="w-full h-[80px] shadow-xl flex justify-center items-center bg-[#06141B] relative">
            <Link to="/" className="w-[103px] h-[45px] object-cover absolute left-[20px] cursor-pointer">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </Link>
            <Link to="/" className="text-[18px] m-[20px] text-[#CCD0CF] hover:text-[#00C896]/50 transition-all duration-300">Home</Link>
            <Link to="/hotels" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">Hotels</Link>
            <Link to="/transport" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">Transport</Link>
            <Link to="/tours" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">Tours</Link>
            <Link to="/guides" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">Guides</Link>
            <Link to="/aboutus" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">About us</Link>
            <Link to="/contactus" className="text-[18px] m-[20px] text-[#CCD0CF]  hover:text-[#00C896]/50 transition-all duration-300">Contact us</Link>
        </header>
    )
}