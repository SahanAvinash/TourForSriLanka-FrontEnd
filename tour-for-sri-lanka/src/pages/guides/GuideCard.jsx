import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const languageLabels = {
  english: "English",
  sinhala: "Sinhala",
  tamil: "Tamil",
  spanish: "Spanish",
  japan: "Japanese",
  chaina: "Chinese",
  korean: "Korean",
};

const GuideCard = ({ guide }) => {
  const navigate = useNavigate();

  const spokenLanguages = Object.entries(languageLabels)
    .filter(([key]) => guide.languages?.[key])
    .map(([, label]) => label);

  return (
    <div className="bg-[#253745] rounded-[16px] sm:rounded-[20px] overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">

      {/* Image */}
      <div className="w-full h-[170px] sm:h-[180px] overflow-hidden">
        <img
          src={guide.profilePic || "/guide_placeholder.jpg"}
          alt={`${guide.firstName} ${guide.lastName}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-[14px] sm:p-[18px]">

        {/* Name + Experience */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-[15px] sm:text-[16px] truncate min-w-0">
            {guide.firstName} {guide.lastName}
          </h3>

          <span className="shrink-0 text-[9px] sm:text-[10px] text-[#00C896] bg-[#00C896]/10 px-[7px] sm:px-[8px] py-[2px] rounded-full whitespace-nowrap">
            {guide.yearsOfExperience}+ yrs
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-[6px] text-gray-400 text-[11px] sm:text-[12px] min-w-0">
          <FaMapMarkerAlt className="text-[#00C896] text-[13px] sm:text-[14px] shrink-0" />

          <span className="truncate">
            {guide.district}, {guide.province}
          </span>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-[5px] sm:gap-[6px] mt-[10px] min-h-[21px]">
          {spokenLanguages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="text-[9px] sm:text-[10px] text-gray-300 bg-[#1a2530] px-[7px] sm:px-[8px] py-[3px] rounded-full"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Price + Button */}
        <div className="flex flex-col min-[400px]:flex-row min-[400px]:items-center justify-between gap-3 mt-[14px]">

          {/* Price */}
          <div className="min-w-0">
            <p className="text-[#00C896] font-bold text-[15px] sm:text-[16px] truncate">
              {guide.currency} {guide.pricePerDay}
            </p>

            <p className="text-gray-500 text-[10px] sm:text-[11px]">
              per day
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => navigate(`/guide/${guide._id}`)}
            className="w-full min-[400px]:w-auto border border-[#00C896] text-[#00C896] px-[14px] sm:px-[16px] py-[7px] sm:py-[8px] rounded-full text-[12px] sm:text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300 whitespace-nowrap"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;