import HotelHeroSection from "./HotelHeroSection";
import HotelList from "./HotelList";

const HotelPage = () =>{
    const handleFileChange = (filters) => {
        console.log(filters)
    }
    return (
        <>
            <HotelHeroSection onFilterChange={handleFileChange}/>
            <HotelList/>
        </>
    )
}
export default HotelPage