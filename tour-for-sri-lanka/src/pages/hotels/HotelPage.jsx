import { useRef, useState } from "react";
import HotelHeroSection from "./HotelHeroSection";
import YourBookings from "./YourBookings";
import HotelList from "./HotelList";
import Footer from "../../components/Footer";

const HotelPage = () => {
  const [filters, setFilters] = useState(null);
  const hotelListRef = useRef(null);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    setTimeout(() => {
      hotelListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <>
      <HotelHeroSection onFilterChange={handleFilterChange} />

      <YourBookings />

      <HotelList
        filters={filters}
        hotelListRef={hotelListRef}
      />

      <Footer />
    </>
  );
};

export default HotelPage;