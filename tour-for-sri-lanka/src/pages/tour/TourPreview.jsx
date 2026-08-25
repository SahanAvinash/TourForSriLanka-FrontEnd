import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TourPreview = () => {
  const [loading, setLoading] = useState(true);
  const [fits, setFits] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [message, setMessage] = useState("");

  const tourData = JSON.parse(sessionStorage.getItem("TourBooking")) || {};

  useEffect(() => {
    checkTripFitStatus();
  }, []);

  // 1. checkTripFit API එක මඟින් දින ගණනට destinations ප්‍රමාණය ප්‍රමාණවත්දැයි පරීක්ෂා කිරීම
  const checkTripFitStatus = async () => {
    try {
      setLoading(true);
      const destinationIds = (tourData.selectedDestinations || []).map((d) => d._id || d);

      const res = await axios.post(`${API_BASE_URL}/api/destination/check-trip-fit`, {
        destinationIds,
        tripDurationDays: tourData.tripDurationDays,
      });

      if (res.data.success) {
        if (res.data.fits) {
          // කාලය ප්‍රමාණවත් නම් කෙලින්ම Route එක Generate කරයි
          setFits(true);
          generateFinalItinerary(destinationIds);
        } else {
          // කාලය ප්‍රමාණවත් නැතිනම් Suggestions 3 පෙන්වයි
          setFits(false);
          setSuggestions(res.data.suggestions || []);
          setMessage(res.data.message);
        }
      }
    } catch (err) {
      console.error("Error checking trip fit:", err);
      toast.error("Failed to verify trip duration fit.");
    } finally {
      setLoading(false);
    }
  };

  // 2. සෘජුව හෝ Suggestion එකක් තෝරාගත් පසු Itinerary Route එක generate කිරීම
  const generateFinalItinerary = async (destinationIds) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/destination/generate-trip`, {
        destinationIds,
        startDistrict: tourData.startDistrict,
        tripDurationDays: tourData.tripDurationDays,
      });

      if (res.data.success) {
        setItineraryDays(res.data.days || []);
        setFits(true);
      }
    } catch (err) {
      console.error("Error generating trip:", err);
      toast.error("Failed to generate itinerary route.");
    } finally {
      setLoading(false);
    }
  };

  // පරිශීලකයා Suggestion 3න් එකක් තෝරාගත් විට
  const handleSelectSuggestion = (suggestion) => {
    generateFinalItinerary(suggestion.destinationIds);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        <p className="text-lg text-[#00C896] animate-pulse">Processing your trip plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11212D] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-3xl font-bold mb-2">Trip Preview & Itinerary</h1>
        <p className="text-gray-400 text-sm mb-8">
          Duration: <span className="text-[#00C896] font-semibold">{tourData.tripDurationDays} Days</span> | Starting from: <span className="text-[#00C896] font-semibold">{tourData.startDistrict}</span>
        </p>

        {/* තත්ත්වය 2: කාලය මදි නම් Suggestions 3 පෙන්වීම */}
        {fits === false && (
          <div className="mb-10">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 text-sm font-medium">{message}</p>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-white">Select a Suggested Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((sug, index) => (
                <div key={index} className="bg-[#253745] border border-gray-700 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <div>
                    <h3 className="text-base font-bold text-[#00C896] mb-2">{sug.label}</h3>
                    <p className="text-xs text-gray-300 mb-3">Selected Destinations ({sug.destinationCount}):</p>
                    <div className="flex flex-wrap gap-1.5 mb-4 max-h-36 overflow-y-auto">
                      {sug.destinations?.map((d, i) => (
                        <span key={i} className="text-xs bg-[#11212D] text-gray-200 px-2.5 py-1 rounded-md border border-gray-700">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full bg-[#00C896] text-[#11212D] font-semibold text-sm py-2.5 rounded-xl hover:opacity-90 transition"
                  >
                    Choose This Option
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* තත්ත්වය 1 හෝ Suggestion එකක් තෝරාගත් පසු පෙන්වන දින අනුව Itinerary එක */}
        {fits === true && itineraryDays.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#00C896]">Your Final Itinerary</h2>
            {itineraryDays.map((dayData) => (
              <div key={dayData.dayNumber} className="bg-[#253745] border border-gray-700 p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-[#00C896] text-[#11212D] text-xs px-2.5 py-1 rounded-full font-bold">Day {dayData.dayNumber}</span>
                </h3>
                <div className="space-y-3">
                  {dayData.destinations.map((dest, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#11212D] p-4 rounded-xl border border-gray-800 gap-2">
                      <div>
                        <p className="font-semibold text-white">{dest.name}</p>
                        <p className="text-xs text-gray-400">{dest.location}</p>
                      </div>
                      <span className="text-xs bg-[#00C896]/10 text-[#00C896] font-medium px-3 py-1.5 rounded-lg border border-[#00C896]/20 w-fit">
                        {dest.timeSlot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TourPreview;