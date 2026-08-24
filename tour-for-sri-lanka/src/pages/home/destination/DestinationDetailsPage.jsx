import { API_BASE_URL } from "../../../config/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import DestinationGallery from "./DestinationGallery";
import DestinationInfo from "./DestinationInfo";
import Footer from "../../../components/Footer";

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/destination/single/${id}`)
      .then((res) => setDestination(res.data))
      .catch((err) => console.log("Failed to load destination", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary-1)] flex items-center justify-center">
        <h1 className="text-[var(--color-text)] text-2xl">Loading...</h1>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[var(--color-primary-1)] flex items-center justify-center">
        <h1 className="text-[var(--color-text)] text-4xl">
          Destination Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary-1)]">
      <Navbar />

      <div className="pt-20">
        <div className="destination-gallery-anim">
          <DestinationGallery destination={destination} />
        </div>

        <div className="destination-info-anim">
          <DestinationInfo destination={destination} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetailsPage;