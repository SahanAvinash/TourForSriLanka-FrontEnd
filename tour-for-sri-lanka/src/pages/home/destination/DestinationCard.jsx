import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const DestinationCard = ({ destination }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -150px 0px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-[var(--color-primary-2)] rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 transition duration-300 destination-card-anim h-full flex flex-col ${
        isVisible ? "in-view" : ""
      }`}
    >
      <img
        src={destination.images?.[0] || "/destination_placeholder.jpg"}
        alt={destination.name}
        className="w-full h-60 object-cover flex-shrink-0"
      />

      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-[var(--color-text)] text-2xl font-bold line-clamp-1">
          {destination.name}
        </h2>

        <div className="flex items-center gap-3 mt-5 text-[var(--color-primary-green)] min-h-[24px]">
          {destination.location && (
            <>
              <FaMapMarkerAlt />
              <span className="line-clamp-1">{destination.location}</span>
            </>
          )}
        </div>

        <p className="text-[var(--color-text)] mt-4 line-clamp-2 flex-1">
          {destination.description}
        </p>

        <Link
          to={`/destinations/${destination.category}/${destination._id}`}
          className="inline-block mt-6 bg-[var(--color-primary-green)] px-6 py-3 rounded-[20px] text-white font-semibold hover:bg-[#00b383] transition duration-300 text-center"
        >
          View Destination
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;