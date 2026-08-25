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
        // Response එක direct array එකක්ද නැතහොත් Object wrapper එකක්ද කියා පරීක්ෂා කිරීම
        const extractedList = Array.isArray(data)
          ? data
          : data.hotels || data.data || [];

        setHotels(extractedList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setHotels([]);
        setLoading(false);
      });
  }, [filters, isSearching]);

  return (
    <section
      id="hotel-results"
      className="bg-[#11212D] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-white">
              {isSearching ? "Search Result" : "Popular Hotels"}
            </h2>

            <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-gray-400 mt-1.5 sm:mt-2">
              {isSearching
                ? "Hotels matching your search"
                : "Explore the best hotels in Sri Lanka"}
            </p>
          </div>

          <button className="self-start sm:self-auto border border-[#00C896] text-[#00C896] px-5 sm:px-6 py-2 rounded-full text-[12px] sm:text-[13px] hover:bg-[#00C896] hover:text-white duration-300">
            View All
          </button>
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