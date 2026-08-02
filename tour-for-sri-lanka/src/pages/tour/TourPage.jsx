import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { MapPin, Route, Users } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const districtOptions = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
].map((d) => ({ value: d, label: d }));

// NEW: 1-10 guests walata dropdown options hadanawa
const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
  value: n,
  label: `${n} ${n === 1 ? "Guest" : "Guests"}`,
}));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#253745",
    borderColor: state.isFocused ? "#00C896" : "#3a4b58",
    boxShadow: "none",
    padding: "2px",
    "&:hover": { borderColor: "#00C896" },
  }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  input: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "#9CA3AF" }),
  menu: (base) => ({ ...base, backgroundColor: "#253745", zIndex: 20 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#11212D" : "#253745",
    color: "#fff",
    cursor: "pointer",
  }),
};

// Date input eka past dates walata select karanna dena ne widihata, today eka minimum widihata set karanawa
const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const TourPage = () => {
  const navigate = useNavigate();
  const [startDistrict, setStartDistrict] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(null); // NEW
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!startDistrict) {
      setError("Please select your starting district first.");
      return;
    }
    if (!startDate) {
      setError("Please select your trip start date.");
      return;
    }
    if (!numberOfGuests) {
      setError("Please select the number of guests.");
      return;
    }

    sessionStorage.setItem("tourStartDistrict", startDistrict.value);
    sessionStorage.setItem("tourStartDate", startDate);
    sessionStorage.setItem("tourNumberOfGuests", numberOfGuests.value); // NEW
    navigate("/tours/plan", {
      state: {
        startDistrict: startDistrict.value,
        startDate,
        numberOfGuests: numberOfGuests.value, // NEW
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#11212D] text-white pt-28">
      <Navbar />
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Plan Your Own <span className="text-[#00C896]">Sri Lanka Trip</span>
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Pick the places you want to visit, and we'll auto-generate your trip route,
          show the distance between stops, and connect you with local guides, hotels,
          and transport in those areas.
        </p>

        <div className="max-w-sm mx-auto mb-4 text-left">
          <label className="block text-sm text-gray-300 mb-2">
            You're starting your trip from...
          </label>
          <Select
            options={districtOptions}
            value={startDistrict}
            onChange={(option) => {
              setStartDistrict(option);
              setError("");
            }}
            placeholder="Select your district..."
            styles={selectStyles}
          />
        </div>

        <div className="max-w-sm mx-auto mb-4 text-left">
          <label className="block text-sm text-gray-300 mb-2">
            Trip start date
          </label>
          <input
            type="date"
            min={getTodayString()}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setError("");
            }}
            className="w-full bg-[#253745] border border-[#3a4b58] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#00C896]"
          />
        </div>

        {/* NEW: Number of guests select */}
        <div className="max-w-sm mx-auto mb-4 text-left">
          <label className="block text-sm text-gray-300 mb-2">
            Number of guests
          </label>
          <Select
            options={guestOptions}
            value={numberOfGuests}
            onChange={(option) => {
              setNumberOfGuests(option);
              setError("");
            }}
            placeholder="Select number of guests..."
            styles={selectStyles}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleStart}
          className="bg-[#00C896] text-[#11212D] font-semibold px-8 py-3 rounded-full hover:opacity-90 transition"
        >
          Start Planning
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#253745] rounded-xl p-6 text-center">
          <MapPin className="mx-auto text-[#00C896] mb-3" size={32} />
          <h3 className="font-semibold mb-2">1. Select Destinations</h3>
          <p className="text-sm text-gray-400">
            Choose as many places as you like, from beaches to ancient cities to wildlife parks.
          </p>
        </div>
        <div className="bg-[#253745] rounded-xl p-6 text-center">
          <Route className="mx-auto text-[#00C896] mb-3" size={32} />
          <h3 className="font-semibold mb-2">2. Get Your Route</h3>
          <p className="text-sm text-gray-400">
            We map out the trip order and show the distance between each stop.
          </p>
        </div>
        <div className="bg-[#253745] rounded-xl p-6 text-center">
          <Users className="mx-auto text-[#00C896] mb-3" size={32} />
          <h3 className="font-semibold mb-2">3. Book Locally</h3>
          <p className="text-sm text-gray-400">
            See guides, hotels, and transport available near each destination.
          </p>
        </div>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default TourPage;