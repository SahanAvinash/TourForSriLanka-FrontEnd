// pages/tour/TourDestinationSelect.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import destinations from "../../data/destinations";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const categories = ["beaches", "ancient", "mountains", "cities", "villages", "wildlife"];

const TourDestinationSelect = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const [activeCategory, setActiveCategory] = useState("beaches");
  const [selected, setSelected] = useState([]);
  const [startDistrict, setStartDistrict] = useState(null);

  useEffect(() => {
    const savedDistrict =
        location.state?.startDistrict || sessionStorage.getItem("tourStartDistrict");
    setStartDistrict(savedDistrict);

    const saved = sessionStorage.getItem("TourBooking");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.selectedDestinations) setSelected(parsed.selectedDestinations);
    }
  }, []);

  const toggleSelect = (dest) => {
    const exists = selected.find((d) => d.id === dest.id);
    if (exists) {
      setSelected(selected.filter((d) => d.id !== dest.id));
    } else {
      setSelected([...selected, dest]);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...selected];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setSelected(updated);
  };

  const moveDown = (index) => {
    if (index === selected.length - 1) return;
    const updated = [...selected];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setSelected(updated);
  };

  const removeSelected = (id) => {
    setSelected(selected.filter((d) => d.id !== id));
  };

  const handleNext = () => {
    if (selected.length < 2) {
      toast.error("Select at least 2 destinations to generate a trip");
      return;
    }
    if(!startDistrict){
        toast.error("Select your starting district first");
        navigate("/tours");
        return;
    }
    sessionStorage.setItem("TourBooking", JSON.stringify({ selectedDestinations: selected, startDistrict }));
    navigate("/tour/preview");
  };

  const filteredDestinations = destinations.filter((d) => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#11212D] text-white">
        <Navbar/>
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-5">
            <h1 className="text-2xl font-bold mb-6">Plan Your Trip</h1>
        </div>

      <div className="flex gap-3 mb-6 flex-wrap pl-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm capitalize transition ${
              activeCategory === cat
                ? "bg-[#00C896] text-[#11212D] font-semibold"
                : "bg-[#253745] text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pl-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDestinations.map((dest) => {
            const isSelected = selected.some((d) => d.id === dest.id);
            return (
              <div
                key={dest.id}
                onClick={() => toggleSelect(dest)}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition ${
                  isSelected ? "border-[#00C896]" : "border-transparent"
                }`}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-32 object-cover" />
                <div className="bg-[#253745] p-2">
                  <p className="text-sm font-semibold">{dest.name}</p>
                  {dest.location && <p className="text-xs text-gray-400">{dest.location}</p>}
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 bg-[#00C896] text-[#11212D] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-80 lg:mr-6 bg-[#253745] rounded-xl p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Your Trip Order</h2>
          {selected.length === 0 && (
            <p className="text-sm text-gray-400">Select destinations to add to your trip.</p>
          )}
          {selected.map((dest, index) => (
            <div key={dest.id} className="flex items-center justify-between bg-[#11212D] rounded-lg px-3 py-2 mb-2">
              <span className="text-sm">{index + 1}. {dest.name}</span>
              <div className="flex gap-1">
                <button onClick={() => moveUp(index)} className="text-xs text-gray-400 hover:text-[#00C896]">↑</button>
                <button onClick={() => moveDown(index)} className="text-xs text-gray-400 hover:text-[#00C896]">↓</button>
                <button onClick={() => removeSelected(dest.id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
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
        <Footer/>
      </div>
    </div>
  );
};

export default TourDestinationSelect;