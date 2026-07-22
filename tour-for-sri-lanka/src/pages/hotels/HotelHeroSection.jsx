import { useState, useEffect } from "react";
import Select from "react-select";
import hotel_bg from "../../assets/hotels/hotel_bg.jpg";
import Navbar from "../../components/Navbar";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaSearch,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

const DISTRICT_OPTIONS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "28px",
        borderRadius: "8px",
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        justifyContent: "flex-start"
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0px",
        flex: "0 1 auto"
    }),
    input: (base) => ({
        ...base,
        color: "#CCD0CF",
        margin: 0,
        padding: 0,
    }),
    singleValue: (base) => ({
        ...base,
        color: "#CCD0CF",
        margin: 0,
    }),
    placeholder: (base) => ({
        ...base,
        color: "#CCD0CF",
        opacity: 0.5,
        fontSize: "14px",
        margin: 0,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
        color: "#CCD0CF",
        cursor: "pointer",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#4A5C6A",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "8px",
    }),
    indicatorSeparator: () => ({
        display: "none",
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "0",
        color: "#CCD0CF",
        "&:hover":{
          color: "#00C896",
          opacity: 0.8
        }
    }),
    indicatorsContainer: (base) => ({
        ...base,
        marginLeft: "6px",
    }),
    menuPortal : (base) => ({
      ...base,
      zIndex: 9999
    })
}

const HotelHeroSection = ({ onFilterChange }) => {
  const [destination, setDestination] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const districtOptions = DISTRICT_OPTIONS.map((d) => ({ label: d, value: d }));

  const handleSearch = () => {
    if(onFilterChange) {
      onFilterChange({
        destination: destination?.value || "",
        checkIn,
        checkOut,
        guests
      })
    }
  }

  return (
    <section className="pt-28 pb-24 bg-[#11212D]">
      <Navbar/>
      <div className="relative h-[430px] rounded-[30px] overflow-visible">
        {/* Background */}
        <div className="absolute inset-y-0 left-4 right-4 rounded-[30px] overflow-hidden">
          <img
            src={hotel_bg}
            alt="Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        {/* Hero Text */}
        <div className="absolute left-12 top-16 z-10">
          <h1 className="text-white text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Hotel Stay
          </h1>
          <p className="text-gray-300 text-lg mt-5">
            Discover and book amazing hotels across Sri Lanka.
          </p>
        </div>

        {/* Search Bar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-5 z-20">
          <div className="bg-[#455766]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl h-[100px] flex items-center px-8">

            {/* Destination */}
            <div className="flex items-center gap-3 flex-1">
              <FaMapMarkerAlt className="text-[#00C896] text-2xl" />

              <div className="w-full">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Choose your
                </label>

                <Select
                  options={districtOptions}
                  value={destination}
                  onChange={setDestination}
                  placeholder="Stay"
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  menuPortalTarget={document.body}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="w-px h-12 bg-white/20 mx-4"></div>

            {/* Check In */}
            <div className="flex items-center gap-3 flex-1">
              <FaCalendarAlt className="text-[#00C896] text-2xl" />

              <div className="w-full">
                <label className="text-sm text-gray-300">
                  Check In
                </label>

                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newCheckIn = e.target.value
                    setCheckIn(newCheckIn)
                    if(checkOut && checkOut < newCheckIn){
                      setCheckOut("")
                    }
                  }}
                  className="w-full bg-transparent text-white outline-none mt-1"
                />
              </div>
            </div>

            <div className="w-px h-12 bg-white/20 mx-4"></div>

            {/* Check Out */}
            <div className="flex items-center gap-3 flex-1">
              <FaCalendarAlt className="text-[#00C896] text-2xl" />

              <div className="w-full">
                <label className="text-sm text-gray-300">
                  Check Out
                </label>

                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-white outline-none mt-1"
                />
              </div>
            </div>

            <div className="w-px h-12 bg-white/20 mx-4"></div>

            {/* Guests */}
            <div className="flex items-center gap-3 flex-1">
              <FaUsers className="text-[#00C896] text-2xl" />

              <div className="w-full">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Guests
                </label>

                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <div className="flex flex-col ml-2">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(20, Number(g) + 1))}
                      className="text-[#CCD0CF] hover:text-[#00C896] hover:opacity-80 leading-none transition-all duration-300"
                    >
                      <FaChevronUp size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, Number(g) - 1))}
                      className="text-[#CCD0CF] hover:text-[#00C896] hover:opacity-80 leading-none mt-1 transition-all duration-300"
                    >
                      <FaChevronDown size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="ml-6 bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-8 py-4 rounded-full flex items-center gap-2 font-semibold"
            >
              <FaSearch />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>       
  );
};

export default HotelHeroSection;