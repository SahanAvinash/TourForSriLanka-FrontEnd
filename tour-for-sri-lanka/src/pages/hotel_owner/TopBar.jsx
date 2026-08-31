import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const roleLabels = {
    hotel_owner: "Hotel Owner",
    vehicle_owner: "Vehicle Owner",
    guide: "Guide",
    traveler: "Traveler"
};

export default function TopBar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user data");
            }
        }
    }, []);

    return (
        <div className="hidden md:flex w-full h-[80px] bg-[#253745] items-center justify-end px-8">
            <div className="flex items-center gap-3">
                <span className="text-[#CCD0CF] font-bold text-right">
                    {roleLabels[user?.role] || "User"}
                    <br />
                    {user?.firstName}
                </span>

                {user?.images[0] ? (
                    <img
                        src={user.image[0]}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-[#00C896]" />
                )}
            </div>
        </div>
    );
}