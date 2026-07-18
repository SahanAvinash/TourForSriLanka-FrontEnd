import { useParams } from "react-router-dom";
import destinations from "../../data/destinations";
import DestinationCard from "./DestinationCard";

const DestinationGrid = () => {

  const { category } = useParams();

  const filtered = destinations.filter(
    (item) => item.category === category
  );

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {filtered.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
          />
        ))}

      </div>

    </section>
  );
};

export default DestinationGrid;