import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import destinations from "../../data/destinations";

import DestinationGallery from "../../components/destination/DestinationGallery";
import DestinationInfo from "../../components/destination/DestinationInfo";

const DestinationDetailsPage = () => {
  const { id } = useParams();

  const destination = destinations.find(
    (item) => item.id === id
  );

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#11212D] flex items-center justify-center">
        <h1 className="text-white text-4xl">Destination Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11212D]">
      <Navbar />
      <div className="pt-20">
        <DestinationGallery destination={destination} />
        <DestinationInfo destination={destination} />
      </div>
    </div>
  );
};

export default DestinationDetailsPage;