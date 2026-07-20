import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function TopBar(){
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if(storedUser){
            const parsedUser = JSON.parse(storedUser)

            if(typeof parsedUser.images === "string"){
                try{
                    parsedUser.images = JSON.parse(parsedUser.images)
                }catch(e){
                    parsedUser.images = []
                }
            }
            console.log("stored user : ",storedUser)
            console.log("parsed images: ",parsedUser.images)
            setUser(parsedUser)
        }
    }, []);

    return(
        <div className="w-full h-[80px] bg-[#253745] flex items-center justify-end px-8">
            <div className="flex items-center gap-3">
                <span className="text-[#CCD0CF] font-bold">Hotel Owner<br/> {user?.firstName}</span>
                {user?.images ?.[0] ? (
                    <img 
                        src={user.images[0]} 
                        alt="profile" 
                        className="w-10 h-10 rounded-full object-cover"
                    />

                ) : (
                    <FaUserCircle className="w-10 h-10 text-[#00C896]" />
                )}
            </div>
        </div>
    )
}