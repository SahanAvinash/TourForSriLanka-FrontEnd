import './App.css'
import AdminPage from './pages/admin/AdminPage';
import {BrowserRouter, Route ,Routes} from "react-router-dom"
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import {Toaster} from "react-hot-toast"
import RegisterRole from './pages/register/registerRole';
import TravelerRegister from './pages/register/travelerRegister';
import VehicleOwnerRegister from './pages/register/vehicleOwnerRegister';
import GuideRegister from './pages/register/guideRegister';
import HotelOwnerRegister from './pages/register/hotelOwnerRegister';

function App() {
  return (
    <BrowserRouter>
    <Toaster/>
      <Routes path="/*">
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register-role" element={<RegisterRole/>}/>
        <Route path="admin/*" element={<AdminPage/>}/>
        <Route path="/*" element={<HomePage/>}/>
        <Route path="/traveler-register" element={<TravelerRegister/>}/>
        <Route path="/vehicle-register" element={<VehicleOwnerRegister/>}/>
        <Route path="/guide-register" element={<GuideRegister/>}/>
        <Route path="/hotel-register" element={<HotelOwnerRegister/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
