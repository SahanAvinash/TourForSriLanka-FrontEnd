import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function TopBar(){
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return(
        <div className="w-full h-[80px] bg-[#253745] flex items-center justify-end px-8">
            <div className="flex items-center gap-3">
                <span className="text-[#CCD0CF] font-semibold">{user?.name}</span>
                {user?.image ?.[0] ? (
                    <img 
                        src={user.images[0]} 
                        alt="profile" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#00C896]"
                    />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-[#00C896]" />
                )}
            </div>
        </div>
    )
}