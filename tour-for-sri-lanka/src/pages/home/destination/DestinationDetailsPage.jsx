import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import DestinationGallery from "./DestinationGallery";
import DestinationInfo from "./DestinationInfo";

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/destination/single/${id}`)
      .then((res) => setDestination(res.data))
      .catch((err) => console.log("Failed to load destination", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11212D] flex items-center justify-center">
        <h1 className="text-white text-2xl">Loading...</h1>
      </div>
    );
  }

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
        <div className="destination-gallery-anim">
          <DestinationGallery destination={destination} />
        </div>
        <div className="destination-info-anim">
          <DestinationInfo destination={destination} />
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsPage;