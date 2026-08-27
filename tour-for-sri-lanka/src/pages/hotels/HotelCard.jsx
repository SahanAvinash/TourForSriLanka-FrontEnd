import { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  let images = [];

  try {
    if (Array.isArray(hotel?.images)) {
      images = hotel.images;
    } else if (typeof hotel?.images === "string") {
      const parsed = JSON.parse(hotel.images);
      images = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    images = [];
  }

  const image = images[0] || "/hotel_placeholder.jpg";

  const handleViewDetails = () => {
    if (hotel?._id) {
      navigate(`/hotel/${hotel._id}`);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`destination-card-anim ${
        inView ? "in-view" : ""
      } bg-[#253745] rounded-[16px] sm:rounded-[20px] overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group w-full`}
    >
      <div className="w-full h-[165px] xs:h-[180px] sm:h-[200px] md:h-[210px] overflow-hidden">
        <img
          src={image}
          alt={hotel?.hotelName || "Hotel"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = "/hotel_placeholder.jpg";
          }}
        />
      </div>

      <div className="p-[13px] xs:p-[15px] sm:p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-[14px] xs:text-[15px] sm:text-[16px] truncate min-w-0 leading-5">
            {hotel?.hotelName || "Hotel"}
          </h3>

          {hotel?.hotelType && (
            <span className="shrink-0 max-w-[90px] sm:max-w-none text-[8px] xs:text-[9px] sm:text-[10px] text-[#00C896] bg-[#00C896]/10 px-[6px] xs:px-[7px] sm:px-[8px] py-[2px] rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
              {hotel.hotelType}
            </span>
          )}
        </div>

        {(hotel?.location || hotel?.district) && (
          <div className="flex items-center gap-1.5 mt-[7px] text-gray-400 text-[11px] xs:text-[12px]">
            <FaMapMarkerAlt className="text-[#00C896] text-[15px] xs:text-[16px] sm:text-[18px] shrink-0" />

            <span className="truncate min-w-0">
              {[hotel.location, hotel.district]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {hotel?.shortDescription && (
          <p className="text-gray-400 text-[11px] xs:text-[12px] sm:text-[13px] mt-[9px] line-clamp-2 leading-4 xs:leading-5">
            {hotel.shortDescription}
          </p>
        )}

        <button
          type="button"
          onClick={handleViewDetails}
          className="mt-[12px] xs:mt-[14px] w-full border border-[#00C896] text-[#00C896] py-[8px] xs:py-[9px] rounded-full text-[11px] xs:text-[12px] sm:text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default HotelCard;