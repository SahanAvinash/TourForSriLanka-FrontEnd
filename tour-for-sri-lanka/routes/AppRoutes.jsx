import { Route, Routes } from "react-router-dom";
import Header from "../src/components/header";
import Home from "../src/pages/home/home";
import Hotels from "../src/pages/hotels/HotelHeroSection";
import Transport from "../src/pages/transport/transport";
import Tours from "../src/pages/tours/tours";
import Guides from "../src/pages/guides/guides";
import AboutUs from "../src/pages/aboutus/aboutus";
import ContactUs from "../src/pages/contactus/contactus";
import ErrorNotFound from "../src/pages/error";
import RegisterRole from "../src/pages/register/registerRole";

export default function HomePage(){
    return(
        <>
            <Header/>
            <div className="w-full h-[calc(100vh-80px)] bg-gradient-to-r from-[#06141B] to-[#253745]">
                <Routes path="/*">
                    <Route path="/" element={<Home/>}/>
                    <Route path="/hotels" element={<Hotels/>}/>
                    <Route path="/transport" element={<Transport/>}/>
                    <Route path="/tours" element={<Tours/>}/>
                    <Route path="/guides" element={<Guides/>}/>
                    <Route path="/aboutus" element={<AboutUs/>}/>
                    <Route path="/contactus" element={<ContactUs/>}/>
                    <Route path="/*" element={<ErrorNotFound/>}/>
                    <Route path="/register" element={<RegisterRole/>}/>
                </Routes>
            </div>
        </>
    )
}