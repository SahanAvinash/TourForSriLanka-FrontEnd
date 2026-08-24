import { useState } from "react";
import HotelHeroSection from "./HotelHeroSection";
import YourBookings from "./YourBookings";
import HotelList from "./HotelList";
import Footer from "../../components/Footer";

const HotelPage = () => {
  const [filters, setFilters] = useState(null);

  return (
    <div className="min-h-screen bg-[#11212D]">
      <HotelHeroSection onFilterChange={setFilters} />
      <YourBookings />
      <HotelList filters={filters} />
      <Footer />
    </div>
  );
};

export default HotelPage;