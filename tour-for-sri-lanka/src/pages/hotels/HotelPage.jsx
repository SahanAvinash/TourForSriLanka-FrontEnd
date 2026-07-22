import HotelHeroSection from "./HotelHeroSection";
import HotelList from "./HotelList";
import { useState } from "react";
import Footer from "../../components/Footer";

const HotelPage = () =>{
    const [filters, setFilters] = useState(null)
    return (
        <>
            <HotelHeroSection onFilterChange={setFilters}/>
            <HotelList filters={filters}/>
            <Footer/>
        </>
    )
}
export default HotelPage