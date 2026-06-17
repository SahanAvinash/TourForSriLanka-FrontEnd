import { Route, Routes } from "react-router-dom";
import Header from "../components/header";
import Home from "./home/home";
import Hotels from "./hotels/hotels";
import Transport from "./transport/transport";
import Tours from "./tours/tours";
import Guides from "./guides/guides";
import AboutUs from "./aboutus/aboutus";
import ContactUs from "./contactus/contactus";
import ErrorNotFound from "./error";
import RegisterRole from "./register/registerRole";

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