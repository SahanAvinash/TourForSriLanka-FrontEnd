import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import Navbar from "../../../components/Navbar";
import DestinationGrid from "./DestinationGrid";
import Footer from "../../../components/Footer";

const DestinationCategoryPage = () => {
  const { category } = useParams();
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    setCategoryData(null);

    axios
      .get(`${API_BASE_URL}/api/category/${category}`)
      .then((res) => setCategoryData(res.data))
      .catch(() => setCategoryData(null));
  }, [category]);

  return (
    <div className="min-h-screen bg-[var(--color-primary-1)]">
      <Navbar />

      <section className="pt-28 text-center">
        <h1 className="text-[var(--color-text)] text-5xl font-bold page-title-anim">
          {categoryData?.name || "Explore Destinations"}
        </h1>

        <p className="text-[var(--color-text)] mt-5 px-[50px] text-lg page-desc-anim">
          {categoryData?.description ||
            "Explore beautiful destinations across Sri Lanka."}
        </p>
      </section>

      <DestinationGrid />
      <Footer />
    </div>
  );
};

export default DestinationCategoryPage;