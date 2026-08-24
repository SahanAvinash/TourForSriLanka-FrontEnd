import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import HotelCard from "./HotelCard";

const HotelList = ({ filters }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSearching =
    filters &&
    (
      filters.destination ||
      filters.checkIn ||
      filters.checkOut ||
      filters.guests
    );

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);

      try {
        let url = `${API_BASE_URL}/api/hotel/`;

        if (isSearching) {
          const params = new URLSearchParams();

          if (filters.destination) {
            params.append("district", filters.destination);
          }

          if (filters.checkIn) {
            params.append("checkIn", filters.checkIn);
          }

          if (filters.checkOut) {
            params.append("checkOut", filters.checkOut);
          }

          if (filters.guests) {
            params.append("guests", filters.guests);
          }

          url = `${API_BASE_URL}/api/hotel/search?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load hotels");
        }

        setHotels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [filters]);

  return (
    <section
      id="hotel-search-results"
      className="px-4 sm:px-6 lg:px-8 pb-16 bg-[#11212D] scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {isSearching ? "Search Result" : "Popular Hotels"}
            </h2>

            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              {isSearching
                ? "Hotels matching your search"
                : "Explore the best hotels in Sri Lanka"}
            </p>

            {/* Selected filters */}
            {isSearching && (
              <div className="flex flex-wrap gap-2 mt-3">

                {filters.destination && (
                  <span className="text-[11px] sm:text-xs text-[#00C896] bg-[#00C896]/10 px-3 py-1 rounded-full">
                    {filters.destination}
                  </span>
                )}

                {filters.checkIn && (
                  <span className="text-[11px] sm:text-xs text-gray-300 bg-[#253745] px-3 py-1 rounded-full">
                    Check-in: {filters.checkIn}
                  </span>
                )}

                {filters.checkOut && (
                  <span className="text-[11px] sm:text-xs text-gray-300 bg-[#253745] px-3 py-1 rounded-full">
                    Check-out: {filters.checkOut}
                  </span>
                )}

                {filters.guests && (
                  <span className="text-[11px] sm:text-xs text-gray-300 bg-[#253745] px-3 py-1 rounded-full">
                    {filters.guests} Guest
                    {Number(filters.guests) !== 1 ? "s" : ""}
                  </span>
                )}

              </div>
            )}
          </div>

          <button
            type="button"
            className="border border-[#00C896] text-[#00C896] px-5 sm:px-6 py-2 rounded-full hover:bg-[#00C896] hover:text-white duration-300 text-sm self-start sm:self-auto"
          >
            View All
          </button>

        </div>

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">

          {loading ? (
            <p className="text-gray-400 col-span-full text-center py-10">
              Loading hotels...
            </p>
          ) : hotels.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-10">
              {isSearching
                ? "No hotels match your search"
                : "No hotels found"}
            </p>
          ) : (
            hotels.map((hotel) => (
              <HotelCard
                key={hotel._id}
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