import { useEffect, useState } from "react";
import GuideCard from "./GuideCard";

const GuideList = ({ filters }) => {
    const [guides, setGuides] = useState([])
    const [loading, setLoading] = useState(true)

    const isSearching = filters && (filters.district || filters.language)

    useEffect(() => {
        setLoading(true)

        const params = new URLSearchParams()
        if(filters?.district) params.append("district", filters.district)
        if(filters?.language) params.append("language", filters.language)

        const url = `http://localhost:3000/api/guide/?${params.toString()}`

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setGuides(data)
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

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {isSearching ? "Search Result" : "Meet Our Guides"}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {isSearching
                                ? "Guides matching your search"
                                : "Explore experienced local guides across Sri Lanka"
                            }
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        <p className="text-gray-400 col-span-full text-center">Loading guides...</p>
                    ) : guides.length === 0 ? (
                        <p className="text-gray-400 col-span-full text-center">
                            {isSearching ? "No guides match your search" : "No guides found"}
                        </p>
                    ) : (
                        guides.map((guide) => (
                            <GuideCard key={guide._id} guide={guide} />
                        ))
                    )}
                </div>

            </div>
        </section>
    );
};

export default GuideList;