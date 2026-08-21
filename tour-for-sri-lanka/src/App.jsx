import './App.css'
import AdminPage from './pages/admin/AdminPage';
import {BrowserRouter, Route ,Routes} from "react-router-dom"
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
import DestinationCategoryPage from "./pages/home/destination/DestinationCategoryPage";
import DestinationDetailsPage from './pages/home/destination/DestinationDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import HotelPage from './pages/hotels/HotelPage';
import HotelsDetailsPage from './pages/hotels/HotelDetailsPage';
import HotelOwnerDashboard from './pages/hotel_owner/HotelOwnerDashboard';
import TravelerProfile from './pages/traveler/TravelerProfile';
import AboutUsPage from './pages/aboutus/AboutUsPage';
import ContactUsPage from './pages/contactus/ContactUsPage';
import HomePage from './pages/home/home';
import Home from './pages/home/home'
import TransportPage from './pages/transport/TransportPage';
import VehicleList from './pages/transport/VehicleList';
import BookingPage from './pages/transport/BookingPage';
import TransportOwnerDashboard from './pages/vehicle_owner/Dashboard';
import GuidePage from './pages/guides/GuidePage';
import GuideDetailsPage from './pages/guides/GuideDetailsPage';
import GuideDashboard from './pages/GuideDashboard/Dashboard';
import TourDestinationSelect from './pages/tour/TourDestinationSelect';
import TourPage from './pages/tour/TourPage';
import TourPreview from './pages/tour/TourPreview';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { TripProvider } from './context/TripContext';


function App() {
  return (
    <TripProvider>
    <BrowserRouter>
    <ScrollToTop/>
    <Toaster/>
      <Routes path="/*">
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register-role" element={<RegisterRole/>}/>
        <Route path="/traveler-register" element={<TravelerRegister/>}/>
        <Route path="/travelerprofilephoto" element={<TravelerProfilePhoto/>}/>
        <Route path="/profile" element={<TravelerProfile/>}/>
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
        <Route path="hotel/:id" element={<HotelsDetailsPage/>}/>

        <Route path="/hotel_owner/dashboard" element={<HotelOwnerDashboard/>}/>

        <Route path="/about-us" element={<AboutUsPage/>}/>

        <Route path="/contact-us" element={<ContactUsPage/>}/>

        <Route path="/transport" element={<TransportPage/>}/>
        <Route path="/transport/vehicles/:type" element={<VehicleList/>}/>
        <Route path="/transport/book/:vehicleId" element={<BookingPage/>}/>
        <Route path="/vehicle_owner/dashboard" element={<TransportOwnerDashboard/>}/>

        <Route path="/guides" element={<GuidePage/>}/>
        <Route path="/guide/:id" element={<GuideDetailsPage/>}/>
        <Route path="/guide/dashboard" element={<GuideDashboard/>}/>

        <Route path="/tours" element={<TourPage/>}/>
        <Route path="/tours/plan" element={<TourDestinationSelect/>}/>
        <Route path="/tour/preview" element={<TourPreview/>}/>

        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
      </Routes>
    </BrowserRouter>
    </TripProvider>
  )
}

export default App
