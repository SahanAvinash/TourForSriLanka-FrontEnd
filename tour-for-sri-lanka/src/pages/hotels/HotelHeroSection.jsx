import { useState } from "react";
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
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "28px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    justifyContent: "flex-start",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0px",
    flex: "0 1 auto",
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
    "&:hover": {
      color: "#00C896",
      opacity: 0.8,
    },
  }),

  indicatorsContainer: (base) => ({
    ...base,
    marginLeft: "6px",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const HotelHeroSection = ({ onFilterChange }) => {
  const [destination, setDestination] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const districtOptions = DISTRICT_OPTIONS.map((district) => ({
    label: district,
    value: district,
  }));

  const handleSearch = () => {
    onFilterChange?.({
      destination: destination?.value || "",
      checkIn,
      checkOut,
      guests,
    });
  };

  return (
    <section className="pt-20 sm:pt-24 lg:pt-28 pb-24 sm:pb-28 bg-[var(--color-primary-1)]">
      <Navbar />

      <div className="relative mx-2 sm:mx-4 min-h-[680px] sm:min-h-[620px] lg:h-[430px] lg:min-h-0 rounded-[20px] sm:rounded-[30px]">

        <div className="hero-bg-anim absolute inset-0 rounded-[20px] sm:rounded-[30px] overflow-hidden">
          <img
            src={hotel_bg}
            alt="Hotel"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="absolute top-10 sm:top-14 lg:top-12 left-5 right-5 sm:left-8 sm:right-8 lg:left-12 lg:right-auto z-10">
          <h1 className="hero-title-anim text-white text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15]">
            Find your Perfect
            <br />
            Hotel Stay
          </h1>

          <p className="hero-desc-anim text-gray-300 text-sm sm:text-base lg:text-lg mt-3 sm:mt-5 max-w-[420px] leading-relaxed">
            Discover and book amazing hotels across Sri Lanka.
          </p>
        </div>

        <div className="animate-box absolute top-[205px] sm:top-[235px] lg:top-auto lg:-bottom-12 left-3 right-3 sm:left-8 sm:right-8 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-auto lg:w-full lg:max-w-[1100px] z-20">

          <div className="bg-[#455766]/90 backdrop-blur-xl rounded-[20px] sm:rounded-[26px] border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-0 lg:h-[100px] flex flex-col lg:flex-row lg:items-center lg:px-8">

            {/* Destination */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaMapMarkerAlt className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm text-gray-300 mb-1">
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
                />
              </div>
            </div>

            <div className="lg:block hidden w-px h-12 bg-white/20 mx-5" />
            <div className="lg:hidden w-full h-px bg-white/10 my-4" />

            {/* Check In */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaCalendarAlt className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm text-gray-300">
                  Check In
                </label>

                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    setCheckIn(newCheckIn);

                    if (checkOut && checkOut <= newCheckIn) {
                      setCheckOut("");
                    }
                  }}
                  className="w-full bg-transparent text-white outline-none mt-1 text-sm sm:text-base min-w-0"
                />
              </div>
            </div>

            <div className="lg:block hidden w-px h-12 bg-white/20 mx-5" />
            <div className="lg:hidden w-full h-px bg-white/10 my-4" />

            {/* Check Out */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaCalendarAlt className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm text-gray-300">
                  Check Out
                </label>

                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                  disabled={!checkIn}
                  className="w-full bg-transparent text-white outline-none mt-1 text-sm sm:text-base min-w-0 disabled:opacity-40"
                />
              </div>
            </div>

            <div className="lg:block hidden w-px h-12 bg-white/20 mx-5" />
            <div className="lg:hidden w-full h-px bg-white/10 my-4" />

            {/* Guests */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaUsers className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm text-gray-300 mb-1">
                  Guests
                </label>

                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guests}
                    onChange={(e) => {
                      const value = Math.max(
                        1,
                        Math.min(20, Number(e.target.value))
                      );

                      setGuests(value);
                    }}
                    className="w-full bg-transparent text-white outline-none text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <div className="flex flex-col ml-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setGuests((g) => Math.min(20, Number(g) + 1))
                      }
                      className="text-[#CCD0CF] hover:text-[#00C896] transition-colors"
                    >
                      <FaChevronUp size={10} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setGuests((g) => Math.max(1, Number(g) - 1))
                      }
                      className="text-[#CCD0CF] hover:text-[#00C896] transition-colors mt-1"
                    >
                      <FaChevronDown size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <button
              onClick={handleSearch}
              className="mt-5 lg:mt-0 lg:ml-6 w-full lg:w-auto shrink-0 bg-[#00C896] hover:bg-[#00b383] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 font-semibold text-sm sm:text-base transition-all duration-300"
            >
              <FaSearch />
              <span>Search Hotels</span>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelHeroSection;