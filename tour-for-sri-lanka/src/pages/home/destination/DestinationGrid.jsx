import { API_BASE_URL } from "../../../config/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import DestinationCard from "./DestinationCard";

const DestinationGrid = () => {
  const { category } = useParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/destination/category/${category}`)
      .then((res) => {
        console.log("DATA:", res.data)
        setDestinations(res.data)
      })
      .catch((err) => console.log("Failed to load destinations", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      {loading ? (
        <p className="text-center text-gray-400">Loading destinations...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination._id}
              destination={destination}
            />
          ))}
          {destinations.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">
              No destinations added in this category yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default DestinationGrid;