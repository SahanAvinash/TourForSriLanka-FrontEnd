import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import DestinationCard from "./DestinationCard";

const DestinationGrid = () => {
  const { category } = useParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/api/destination/category/${category}`)
      .then((res) => setDestinations(res.data))
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      {loading ? (
        <p className="text-center text-[var(--color-text)]">
          Loading destinations...
        </p>
      ) : destinations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination._id}
              destination={destination}
            />
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-text)] text-center">
          No destinations added in this category yet.
        </p>
      )}
    </section>
  );
};

export default DestinationGrid;