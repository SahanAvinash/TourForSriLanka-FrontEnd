import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import HotelCard from "./HotelCard";

const HotelList = ({ filters }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSearching =
    !!filters &&
    !!(
      filters.destination ||
      filters.guests ||
      filters.checkIn ||
      filters.checkOut
    );

  useEffect(() => {
    let cancelled = false;

    const fetchHotels = async () => {
      setLoading(true);

      try {
        let url = `${API_BASE_URL}/api/hotel/`;

        if (isSearching) {
          const params = new URLSearchParams();

          if (filters?.destination) {
            params.append("district", filters.destination);
          }

          if (filters?.guests) {
            params.append("guests", filters.guests);
          }

          if (filters?.checkIn) {
            params.append("checkIn", filters.checkIn);
          }

          if (filters?.checkOut) {
            params.append("checkOut", filters.checkOut);
          }

          url = `${API_BASE_URL}/api/hotel/search?${params.toString()}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const data = await res.json();

        const extractedList = Array.isArray(data)
          ? data
          : Array.isArray(data?.hotels)
          ? data.hotels
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (!cancelled) {
          setHotels(extractedList);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Fetch hotels error:", error);
          setHotels([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHotels();

    return () => {
      cancelled = true;
    };
  }, [filters, isSearching]);

  const handleViewAll = () => {
    window.scrollTo({
      top: document.getElementById("hotel-results")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="hotel-results"
      className="bg-[#11212D] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-white">
              {isSearching ? "Search Results" : "Popular Hotels"}
            </h2>

            <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-gray-400 mt-1.5 sm:mt-2">
              {isSearching
                ? "Hotels matching your search"
                : "Explore the best hotels in Sri Lanka"}
            </p>
          </div>

          {!isSearching && hotels.length > 0 && (
            <button
              type="button"
              onClick={handleViewAll}
              className="self-start sm:self-auto border border-[#00C896] text-[#00C896] px-5 sm:px-6 py-2 rounded-full text-[12px] sm:text-[13px] hover:bg-[#00C896] hover:text-white duration-300"
            >
              View All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {loading ? (
            <p className="text-gray-400 col-span-full text-center text-[13px] sm:text-[14px]">
              Loading hotels...
            </p>
          ) : hotels.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center text-[13px] sm:text-[14px]">
              {isSearching
                ? "No hotels match your search"
                : "No hotels found"}
            </p>
          ) : (
            hotels.map((hotel) => (
              <HotelCard
                key={hotel._id || hotel.email}
                hotel={hotel}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default HotelList;