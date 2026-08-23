import GuideHeroSection from "./GuideHeroSection";
import YourGuideBookings from "./YourGuideBookings";
import GuideList from "./GuideList";
import { useState } from "react";
import Footer from "../../components/Footer";

const GuidePage = () => {
    const [filters, setFilters] = useState(null)
    return (
        <>
            <GuideHeroSection onFilterChange={setFilters}/>
            <YourGuideBookings/>
            <GuideList filters={filters}/>
            <Footer/>
        </>
    )
}
export default GuidePage