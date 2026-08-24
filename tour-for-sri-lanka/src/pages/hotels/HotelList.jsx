import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import HotelCard from "./HotelCard";

const HotelList = ({ filters }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSearching =
    filters && (filters.destination || filters.guests);

  useEffect(() => {
    setLoading(true);

    let url = `${API_BASE_URL}/api/hotel/`;

    if (isSearching) {
      const params = new URLSearchParams();

      if (filters.destination) {
        params.append("district", filters.destination);
      }

      if (filters.guests) {
        params.append("guests", filters.guests);
      }

      url = `${API_BASE_URL}/api/hotel/search?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setHotels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setHotels([]);
        setLoading(false);
      });
  }, [filters]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#11212D]">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">

          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {isSearching ? "Search Result" : "Popular Hotels"}
            </h2>

            <p className="text-gray-400 mt-1.5 sm:mt-2 text-sm sm:text-base">
              {isSearching
                ? "Hotels matching your search"
                : "Explore the best hotels in Sri Lanka"}
            </p>
          </div>

          <button
            className="self-start sm:self-auto border border-[#00C896] text-[#00C896] px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base hover:bg-[#00C896] hover:text-white duration-300 whitespace-nowrap"
          >
            View All
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">

          {loading ? (
            <p className="text-gray-400 col-span-full text-center py-8">
              Loading hotels...
            </p>
          ) : hotels.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-8 text-sm sm:text-base">
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