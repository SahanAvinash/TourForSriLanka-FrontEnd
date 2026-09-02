import { FaBars } from "react-icons/fa";
import logo from "../../assets/logo.png"; // Logo eka import kala

export default function GuideTopBar({ onMenuClick }) {
    return (
        <header className="h-16 bg-[#253745] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 border-b border-[#4A5C6A]">
            <div className="flex items-center gap-3">
                {/* Mobile Hamburger Button */}
                <button 
                    onClick={onMenuClick} 
                    className="text-[#CCD0CF] text-xl md:hidden cursor-pointer hover:text-[#00C896] transition-colors p-1"
                >
                    <FaBars />
                </button>
                
                {/* Logo eka methanin display wenawa */}
                <img src={logo} alt="logo" className="w-28 sm:w-32 object-contain" />
            </div>
        </header>
    );
}