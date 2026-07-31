import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const languageLabels = {
    english: "English", sinhala: "Sinhala", tamil: "Tamil", spanish: "Spanish",
    japan: "Japanese", chaina: "Chinese", korean: "Korean"
}

const GuideCard = ({ guide }) => {
    const navigate = useNavigate()

    const spokenLanguages = Object.entries(languageLabels)
        .filter(([key]) => guide.languages?.[key])
        .map(([, label]) => label)

    return (
        <div className="bg-[#253745] rounded-[20px] overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="w-full h-[180px] overflow-hidden">
                <img
                    src={guide.profilePic || "/guide_placeholder.jpg"}
                    alt={`${guide.firstName} ${guide.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                />
            </div>

            <div className="p-[18px]">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-[16px] truncate">
                        {guide.firstName} {guide.lastName}
                    </h3>
                    <span className="text-[10px] text-[#00C896] bg-[#00C896]/10 px-[8px] py-[2px] rounded-full whitespace-nowrap ml-[8px]">
                        {guide.yearsOfExperience}+ yrs
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-[6px] text-gray-400 text-[12px]">
                    <FaMapMarkerAlt className="text-[#00C896] text-[14px]" />
                    <span className="truncate">{guide.district}, {guide.province}</span>
                </div>

                <div className="flex flex-wrap gap-[6px] mt-[10px]">
                    {spokenLanguages.slice(0, 3).map((lang) => (
                        <span key={lang} className="text-[10px] text-gray-300 bg-[#1a2530] px-[8px] py-[3px] rounded-full">
                            {lang}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-[14px]">
                    <div>
                        <p className="text-[#00C896] font-bold text-[16px]">{guide.currency} {guide.pricePerDay}</p>
                        <p className="text-gray-500 text-[11px]">per day</p>
                    </div>
                    <button
                        onClick={() => navigate(`/guide/${guide._id}`)}
                        className="border border-[#00C896] text-[#00C896] px-[16px] py-[8px] rounded-full text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300"
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuideCard