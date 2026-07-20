import { useEffect, useState } from "react";
import HotelCard from "./HotelCard";

const HotelList = ({filters}) => {
    const [hotels, setHotels] = useState([])
    const [loading, setLoading] = useState(true)

    const isSearching = filters && (filters.destination || filters.guests)

    useEffect(() => {
        setLoading(true)

        let url = "http://localhost:3000/api/hotel/"
        if(isSearching){
            const params = new URLSearchParams()
            if(filters.destination) params.append("district",filters.destination)
            if(filters.guests) params.append("guests", filters.guests)
            url = `http://localhost:3000/api/hotel/search?${params.toString()}`
        }
        console.log("FETCH URL:", url)
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setHotels(data)
                setLoading(false)
            })
            .catch((error) => {
                console.log(error)
                setLoading(false)
            })
    }, [filters])

    return (
        <section className="px-8 pb-16 bg-[#11212D]">
            <div className="max-w-7xl mx-auto">

                {/* Heading */}

                <div className="flex justify-between items-center mb-8">

                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {isSearching ? "Search Result" : "Popular Hotels"}
                        </h2>

                        <p className="text-gray-400 mt-2">
                            {isSearching
                                ? "Hotels matching your search"
                                : "Explore the best hotels in Sri Lanka"
                            }
                        </p>
                    </div>

                    <button className="border border-[#00C896] text-[#00C896] px-6 py-2 rounded-full hover:bg-[#00C896] hover:text-white duration-300">
                        View All
                    </button>

                </div>

                {/* Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {loading ? (
                        <p className="text-gray-400 col-span-full text-center">Loading hotels...</p>
                    ) : hotels.length === 0 ? (
                        <p className="text-gray-400 col-span-full text-center">
                            {isSearching ? "No hotels match your search" : "No hotels found"}
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