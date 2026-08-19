import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import DestinationGrid from "../../components/destination/DestinationGrid";
import Footer from "../../components/Footer";

const DestinationCategoryPage = () => {
  const { category } = useParams();
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/category/${category}`)
      .then((res) => setCategoryData(res.data))
      .catch((err) => console.log("Failed to load category", err));
  }, [category]);

  return (
    <div className="min-h-screen bg-[#11212D]">
      <Navbar/>
      <section className="pt-28 text-center">
        <h1 className="text-white text-5xl font-bold">
          {categoryData ? categoryData.name : ""}
        </h1>
        <p className="text-gray-400 mt-5 text-lg pl-[50px] pr-[50px]">
          {categoryData?.description || "Explore beautiful destinations across Sri Lanka."}
        </p>
      </section>

      <DestinationGrid />
      <Footer/>
    </div>
  );
};

export default DestinationCategoryPage;