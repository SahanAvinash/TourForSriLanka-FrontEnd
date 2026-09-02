import { FaBars } from "react-icons/fa";

export default function TopBar({ onMenuClick }) {
    return (
        <header className="h-16 bg-[#253745] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 border-b border-[#4A5C6A]">
            <div className="flex items-center gap-3">
                {/* Hamburger Button - Mobile waladi witharai penne (md:hidden) */}
                <button 
                    onClick={onMenuClick} 
                    className="text-[#CCD0CF] text-xl md:hidden cursor-pointer hover:text-[#00C896] transition-colors"
                >
                    <FaBars />
                </button>
                
            </div>
            
            {/* Thawath details monawahari thiyenwanam methana danna puluwan */}
        </header>
    );
}