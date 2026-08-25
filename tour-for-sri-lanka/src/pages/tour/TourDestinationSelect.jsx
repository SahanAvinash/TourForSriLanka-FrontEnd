import { API_BASE_URL } from "../../config/api";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTrip } from "../../context/TripContext";

const TripDestinationCard = ({ dest, isSelected, onToggle, delay = 0 }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -150px 0px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onToggle(dest)}
      className={`group relative h-[280px] rounded-3xl overflow-hidden shadow-xl cursor-pointer category-card-anim border-2 ${
        isSelected ? "border-[#00C896]" : "border-transparent"
      } ${isVisible ? "in-view" : ""}`}
      style={{ animationDelay: isVisible ? `${delay}s` : "0s" }}
    >
      <img
        src={dest.images?.[0]}
        alt={dest.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition duration-300"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <h3 className="text-white text-3xl font-bold leading-tight text-center group-hover:-translate-y-2 transition duration-300">
          {dest.name}
        </h3>
        {dest.location && (
          <p className="text-gray-300 text-sm mt-2 group-hover:-translate-y-2 transition duration-300">
            {dest.location}
          </p>
        )}
      </div>

      {isSelected && (
        <span className="absolute top-3 right-3 bg-[#00C896] text-[#11212D] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow z-10">
          ✓
        </span>
      )}
    </div>
  );
};

const TourDestinationSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [startDistrict, setStartDistrict] = useState(null);
  
  // Trip Duration එක තබා ගැනීමට State එකක් (Default = 1 Day)
  const [tripDurationDays, setTripDurationDays] = useState(1);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const [destinationsList, setDestinationsList] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const { tripDestinations, toggleDestination, removeDestination, setTripDestinations, isInTrip } = useTrip();

  useEffect(() => {
    const savedDistrict =
      location.state?.startDistrict || sessionStorage.getItem("tourStartDistrict");
    setStartDistrict(savedDistrict);
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    axios
      .get(`${API_BASE_URL}/api/category`)
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setActiveCategory(res.data[0]._id);
        }
      })
      .catch((err) => console.log("Failed to load categories", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!activeCategory) return;

    setLoadingDestinations(true);
    axios
      .get(`${API_BASE_URL}/api/destination/category/${activeCategory}`)
      .then((res) => setDestinationsList(res.data))
      .catch((err) => console.log("Failed to load destinations", err))
      .finally(() => setLoadingDestinations(false));
  }, [activeCategory]);

  const toggleSelect = (dest) => {
    toggleDestination(dest);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...tripDestinations];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setTripDestinations(updated);
  };

  const moveDown = (index) => {
    if (index === tripDestinations.length - 1) return;
    const updated = [...tripDestinations];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setTripDestinations(updated);
  };

  const removeSelected = (id) => {
    removeDestination(id);
  };

  // Step 2: Feasibility & Maximum Destinations Validation Rule
  const handleNext = () => {
    if (tripDestinations.length < 2) {
      toast.error("Select at least 2 destinations to generate a trip");
      return;
    }

    if (!startDistrict) {
      toast.error("Select your starting district first");
      navigate("/tours");
      return;
    }

    // දවසකට සාමාන්‍යයෙන් 8:00 AM - 6:00 PM අතර යා හැකි උපරිම ස්ථාන ගණන (උදා: 4)
    const MAX_DEST_PER_DAY = 4;
    const maxAllowed = tripDurationDays * MAX_DEST_PER_DAY;

    if (tripDestinations.length > maxAllowed) {
      toast.error(
        `It is impossible to visit ${tripDestinations.length} destinations in ${tripDurationDays} day(s) (8:00 AM - 6:00 PM). Please select maximum ${maxAllowed} locations or increase trip duration.`,
        { duration: 5000 }
      );
      return;
    }

    // Pass data to sessionStorage
    sessionStorage.setItem(
      "TourBooking",
      JSON.stringify({ 
        selectedDestinations: tripDestinations, 
        startDistrict,
        tripDurationDays: Number(tripDurationDays)
      })
    );

    navigate("/tour/preview");
  };

  return (
    <div className="min-h-screen bg-[#11212D] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold page-title-anim">Plan Your Trip</h1>

        {/* Trip Duration Input Selector */}
        <div className="flex items-center gap-3 bg-[#253745] px-4 py-2 rounded-xl border border-gray-700">
          <label className="text-sm font-medium text-gray-300">Trip Duration (Days):</label>
          <input
            type="number"
            min="1"
            max="14"
            value={tripDurationDays}
            onChange={(e) => setTripDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 bg-[#11212D] text-center text-[#00C896] font-bold py-1 px-2 rounded border border-gray-600 focus:outline-none focus:border-[#00C896]"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap pl-6">
        {loadingCategories && (
          <p className="text-sm text-gray-400">Loading categories...</p>
        )}
        {!loadingCategories &&
          categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition ${
                activeCategory === cat._id
                  ? "bg-[#00C896] text-[#11212D] font-semibold"
                  : "bg-[#253745] text-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pl-6 pr-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingDestinations && (
            <p className="text-gray-400 col-span-full">Loading destinations...</p>
          )}
          {!loadingDestinations && destinationsList.length === 0 && (
            <p className="text-gray-400 col-span-full">
              No destinations added in this category yet.
            </p>
          )}
          {!loadingDestinations &&
            destinationsList.map((dest, index) => (
              <TripDestinationCard
                key={dest._id}
                dest={dest}
                isSelected={isInTrip(dest._id)}
                onToggle={toggleSelect}
                delay={(index % 3) * 0.15}
              />
            ))}
        </div>

        <div className="w-full lg:w-80 bg-[#253745] rounded-xl p-4 h-fit sticky top-28">
          <h2 className="text-lg font-semibold mb-3">Your Trip Order</h2>
          {tripDestinations.length === 0 && (
            <p className="text-sm text-gray-400">Select destinations to add to your trip.</p>
          )}
          {tripDestinations.map((dest, index) => (
            <div key={dest._id} className="flex items-center justify-between bg-[#11212D] rounded-lg px-3 py-2 mb-2">
              <span className="text-sm truncate max-w-[180px]">{index + 1}. {dest.name}</span>
              <div className="flex gap-1">
                <button onClick={() => moveUp(index)} className="text-xs text-gray-400 hover:text-[#00C896]">↑</button>
                <button onClick={() => moveDown(index)} className="text-xs text-gray-400 hover:text-[#00C896]">↓</button>
                <button onClick={() => removeSelected(dest._id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
              </div>
            </div>
          ))}

          <button
            onClick={handleNext}
            className="w-full mt-4 bg-[#00C896] text-[#11212D] font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Generate Trip
          </button>
        </div>
      </div>
      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
};

export default TourDestinationSelect;