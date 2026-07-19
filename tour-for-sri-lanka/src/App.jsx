import './App.css'
import AdminPage from './pages/admin/AdminPage';
import {BrowserRouter, Route ,Routes} from "react-router-dom"
import HomePage from '../routes/AppRoutes';
import LoginPage from './pages/loginPage';
import {Toaster} from "react-hot-toast"
import RegisterRole from './pages/register/registerRole';
import TravelerRegister from './pages/register/traveler_register/travelerRegister';
import VehicleOwnerRegister from './pages/register/vehicle_owner_register/vehicleOwnerAccount';
import GuideRegister from './pages/register/guide_register/guideRegister';
import HotelOwnerRegister from './pages/register/hotel_register/hotelOwnerRegister';
import TravelerProfilePhoto from './pages/register/traveler_register/travelerProfilePhoto';
import VehicleOwnerInformation from './pages/register/vehicle_owner_register/vehicleOwnerInformation';
import VehicleFacilities from './pages/register/vehicle_owner_register/vehicleFacilities';
import Verification from './pages/register/vehicle_owner_register/vehicleVerification';
import VehicleVerification from './pages/register/vehicle_owner_register/vehicleVerification';
import VerifyOtp from './pages/register/traveler_register/verifyOtp';
import VerifyOtpTransport from './pages/register/vehicle_owner_register/VerifyOtpTransport';
import GuideInformation from './pages/register/guide_register/guideInfo';
import GuideLanguageSkills from './pages/register/guide_register/guideSkils';
import GuidePricing from './pages/register/guide_register/guidePricing';
import VerifyOtpGuide from './pages/register/guide_register/verifyOtpGuide';
import HotelInformation from './pages/register/hotel_register/hotelInformation';
import HotelFacilities from './pages/register/hotel_register/hotelFacilities';
import HotelVerification from './pages/register/hotel_register/hotelVerification';
import VerifyOtpHotel from './pages/register/hotel_register/verifyOtpHotel';
import DestinationCategoryPage from "./pages/Destinations/DestinationCategoryPage";
import DestinationDetailsPage from './pages/Destinations/DestinationDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import HotelPage from './pages/hotels/HotelPage';


function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>
    <Toaster/>
      <Routes path="/*">
        <Route path="/*" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register-role" element={<RegisterRole/>}/>
        <Route path="/traveler-register" element={<TravelerRegister/>}/>
        <Route path="/travelerprofilephoto" element={<TravelerProfilePhoto/>}/>
        <Route path="/vehicle-register" element={<VehicleOwnerRegister/>}/>
        <Route path="/vehicleownerinformation" element={<VehicleOwnerInformation/>}/>
        <Route path="/vehiclefacilities" element={<VehicleFacilities/>}/>
        <Route path="vehicleverification" element={<VehicleVerification/>}/>
        <Route path="/guide-register" element={<GuideRegister/>}/>
        <Route path="/guideInformation" element={<GuideInformation/>}/>
        <Route path="/guidelanguageskills" element={<GuideLanguageSkills/>}/>
        <Route path="/guidepricing" element={<GuidePricing/>}/>
        <Route path="/hotel-register" element={<HotelOwnerRegister/>}/>
        <Route path="/hotelinformation" element={<HotelInformation/>}/>
        <Route path="/hotelfacilities" element={<HotelFacilities/>}/>
        <Route path='/hotelverification' element={<HotelVerification/>}/>
        <Route path="admin/*" element={<AdminPage/>}/>
        <Route path="/verify-otp" element={<VerifyOtp/>}/>
        <Route path="/verify-otp-transport" element={<VerifyOtpTransport/>}/>
        <Route path="/verify-otp-guide" element={<VerifyOtpGuide/>}/>
        <Route path="/verify-otp-hotel" element={<VerifyOtpHotel/>}/>
        <Route path="/destinations/:category" element={<DestinationCategoryPage />} />
        <Route path="/destinations/:category/:id" element={<DestinationDetailsPage />} />
        <Route path="/hotels" element={<HotelPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
