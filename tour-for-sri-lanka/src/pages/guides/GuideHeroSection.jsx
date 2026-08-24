import { useState } from "react";
import Select from "react-select";
import Navbar from "../../components/Navbar";
import guide_bg from "../../assets/guide/guide_bg.jpg";
import {
  FaMapMarkerAlt,
  FaLanguage,
  FaSearch,
  FaHiking,
} from "react-icons/fa";
import toast from "react-hot-toast";

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

const LANGUAGE_OPTIONS = [
  { label: "English", value: "english" },
  { label: "Sinhala", value: "sinhala" },
  { label: "Tamil", value: "tamil" },
  { label: "Spanish", value: "spanish" },
  { label: "Japanese", value: "japan" },
  { label: "Chinese", value: "chaina" },
  { label: "Korean", value: "korean" },
];

const SKILL_OPTIONS = [
  { label: "Cultural Tours", value: "CulturalTours" },
  { label: "Adventure Tours", value: "AdventureTours" },
  { label: "Wildlife Tours", value: "WildLifeTours" },
  { label: "Hiking", value: "Hiking" },
  { label: "Surfing Guide", value: "SurfingGuide" },
  { label: "Food Tours", value: "FoodTours" },
  { label: "Photography Tours", value: "PhotographyTours" },
  { label: "Historical Tours", value: "HistoricalTours" },
  { label: "City Tours", value: "CityTours" },
  { label: "Nature Guide", value: "NatureGuide" },
  { label: "Other", value: "Other" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    width: "100%",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0",
    minWidth: 0,
    overflow: "hidden",
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#CCD0CF",
    opacity: 0.5,
    fontSize: "14px",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
    flexShrink: 0,
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const GuideHeroSection = ({ onFilterChange }) => {
  const [district, setDistrict] = useState(null);
  const [language, setLanguage] = useState(null);
  const [skill, setSkill] = useState(null);

  const districtOptions = DISTRICT_OPTIONS.map((d) => ({
    label: d,
    value: d,
  }));

  const handleSearch = () => {
    if (!district?.value && !language?.value && !skill?.value) {
      toast.error("Please select at least one filter to search");
      return;
    }

    if (onFilterChange) {
      onFilterChange({
        district: district?.value || "",
        language: language?.value || "",
        skill: skill?.value || "",
      });
    }
  };

  return (
    <section className="pt-24 sm:pt-28 pb-28 sm:pb-24 bg-[#11212D]">
      <Navbar />

      <div className="relative min-h-[680px] sm:min-h-[620px] lg:h-[430px] lg:min-h-0 rounded-[20px] sm:rounded-[30px] overflow-visible mx-2 sm:mx-4">

        {/* Background */}
        <div className="hero-bg-anim absolute inset-0 rounded-[20px] sm:rounded-[30px] overflow-hidden">
          <img
            src={guide_bg}
            alt="Guide"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />

          {/* Bottom Fade */}
          <div className="absolute inset-x-0 bottom-0 h-[280px] sm:h-[240px] bg-gradient-to-b from-transparent via-[#11212D]/55 to-[#11212D]" />
        </div>

        {/* Hero Text */}
        <div className="absolute left-5 right-5 sm:left-10 sm:right-10 lg:left-12 lg:right-auto top-10 sm:top-16 z-10">
          <h1 className="hero-title-anim text-white text-[32px] sm:text-5xl lg:text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Local Guide
          </h1>

          <p className="hero-desc-anim text-gray-300 text-sm sm:text-lg mt-3 sm:mt-5 max-w-xl">
            Explore Sri Lanka with experienced, licensed local guides.
          </p>
        </div>

        {/* Search Box */}
        <div className="animate-box absolute top-[200px] sm:top-[230px] lg:-bottom-12 lg:top-auto left-3 right-3 sm:left-8 sm:right-8 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-auto lg:w-full lg:max-w-[1000px] z-20">

          <div className="bg-[#455766]/80 backdrop-blur-xl rounded-[20px] sm:rounded-[28px] border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-0 lg:h-[100px] flex flex-col lg:flex-row lg:items-center lg:px-8">

            {/* District */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaMapMarkerAlt className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  District
                </label>

                <Select
                  options={districtOptions}
                  value={district}
                  onChange={setDistrict}
                  placeholder="Any District"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-white/20 mx-4" />

            <div className="lg:hidden h-px w-full bg-white/10 my-4" />

            {/* Language */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaLanguage className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Language
                </label>

                <Select
                  options={LANGUAGE_OPTIONS}
                  value={language}
                  onChange={setLanguage}
                  placeholder="Any Language"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-white/20 mx-4" />

            <div className="lg:hidden h-px w-full bg-white/10 my-4" />

            {/* Skills */}
            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <FaHiking className="text-[#00C896] text-xl sm:text-2xl shrink-0" />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Skills
                </label>

                <Select
                  options={SKILL_OPTIONS}
                  value={skill}
                  onChange={setSkill}
                  placeholder="Any Skill"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                />
              </div>
            </div>

            {/* Search */}
            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 lg:mt-0 lg:ml-6 bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-6 sm:px-8 py-3.5 rounded-full flex items-center justify-center gap-2 font-semibold w-full lg:w-auto whitespace-nowrap text-sm sm:text-base"
            >
              <FaSearch />
              Search Guides
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideHeroSection;