import GuideHeroSection from "./GuideHeroSection";
import GuideList from "./GuideList";
import { useState } from "react";
import Footer from "../../components/Footer";

const GuidePage = () => {
    const [filters, setFilters] = useState(null)
    return (
        <>
            <GuideHeroSection onFilterChange={setFilters}/>
            <GuideList filters={filters}/>
            <Footer/>
        </>
    )
}
export default GuidePage