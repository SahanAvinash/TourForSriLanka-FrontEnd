import HotelHeroSection from "./HotelHeroSection";
import HotelList from "./HotelList";
import { useState } from "react";

const HotelPage = () =>{
    const [filters, setFilters] = useState(null)
    return (
        <>
            <HotelHeroSection onFilterChange={setFilters}/>
            <HotelList filters={filters}/>
        </>
    )
}
export default HotelPage