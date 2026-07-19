import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HotelCard = ({ hotel }) => {
    const navigate = useNavigate()

    let imagesArray = []
    try{
        imagesArray = typeof hotel.images === "string"
        ? JSON.parse(hotel.images)
        : hotel.images
    }catch(err){
        imagesArray = []
    }
    const image = imagesArray && imagesArray.length > 0
        ? imagesArray[0]
        : "/hotel_placeholder.jpg"

    return (
        <div className="bg-[#253745] rounded-[20px] overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="w-full h-[180px] overflow-hidden">
                <img
                    src={image}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                />
            </div>

            <div className="p-[18px]">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-[16px] truncate">
                        {hotel.hotelName}
                    </h3>
                    <span className="text-[10px] text-[#00C896] bg-[#00C896]/10 px-[8px] py-[2px] rounded-full whitespace-nowrap ml-[8px]">
                        {hotel.hotelType}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-[6px] text-gray-400 text-[12px]">
                    <FaMapMarkerAlt className="text-[#00C896] text-[20px]" />
                    <span className="truncate">{hotel.location}, {hotel.district}</span>
                </div>

                <p className="text-gray-400 text-[12px] mt-[10px] line-clamp-2">
                    {hotel.shortDescription}
                </p>

                <button 
                    onClick={() => navigate(`/hotel/${hotel._id}`)}
                    className="mt-[15px] w-full border border-[#00C896] text-[#00C896] py-[8px] rounded-full text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300">
                    View Details
                </button>
            </div>
        </div>
    )
}

export default HotelCard