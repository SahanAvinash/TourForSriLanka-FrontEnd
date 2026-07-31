import { useState } from "react";
import Select from "react-select";
import Navbar from "../../components/Navbar";
import guide_bg from "../../assets/guide/guide_bg.jpg";
import { FaMapMarkerAlt, FaLanguage, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const DISTRICT_OPTIONS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
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

const selectStyles = {
    control: (base) => ({
        ...base, minHeight: "28px", borderRadius: "8px", backgroundColor: "transparent",
        border: "none", boxShadow: "none", justifyContent: "flex-start"
    }),
    valueContainer: (base) => ({ ...base, padding: "0px", flex: "0 1 auto" }),
    input: (base) => ({ ...base, color: "#CCD0CF", margin: 0, padding: 0 }),
    singleValue: (base) => ({ ...base, color: "#CCD0CF", margin: 0 }),
    placeholder: (base) => ({ ...base, color: "#CCD0CF", opacity: 0.5, fontSize: "14px", margin: 0 }),
    option: (base, state) => ({
        ...base, backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A", color: "#CCD0CF", cursor: "pointer"
    }),
    menu: (base) => ({ ...base, backgroundColor: "#4A5C6A", borderRadius: "12px", overflow: "hidden", marginTop: "8px" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
        ...base, padding: "0", color: "#CCD0CF", "&:hover": { color: "#00C896", opacity: 0.8 }
    }),
    indicatorsContainer: (base) => ({ ...base, marginLeft: "6px" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
}

const GuideHeroSection = ({ onFilterChange }) => {
  const [district, setDistrict] = useState(null)
  const [language, setLanguage] = useState(null)

  const districtOptions = DISTRICT_OPTIONS.map((d) => ({ label: d, value: d }));

    const handleSearch = () => {
        if(!district?.value && !language?.value){
            toast.error("Please select at least one filter to search")
            return
        }
        if(onFilterChange){
            onFilterChange({
                district: district?.value || "",
                language: language?.value || ""
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
            src={guide_bg}
            alt="Guide"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>

        {/* Hero Text */}
        <div className="absolute left-12 top-16 z-10">
          <h1 className="text-white text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Local Guide
          </h1>
          <p className="text-gray-300 text-lg mt-5">
            Explore Sri Lanka with experienced, licensed local guides.
          </p>
        </div>

        {/* Search Bar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[800px] px-5 z-20">
          <div className="bg-[#455766]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl h-[100px] flex items-center px-8">

            <div className="flex items-center gap-3 flex-1">
              <FaMapMarkerAlt className="text-[#00C896] text-2xl" />
              <div className="w-full">
                <label className="block text-sm text-gray-300 mb-0.5">District</label>
                <Select
                  options={districtOptions}
                  value={district}
                  onChange={setDistrict}
                  placeholder="Any District"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </div>
            </div>

            <div className="w-px h-12 bg-white/20 mx-4"></div>

            <div className="flex items-center gap-3 flex-1">
              <FaLanguage className="text-[#00C896] text-2xl" />
              <div className="w-full">
                <label className="block text-sm text-gray-300 mb-0.5">Language</label>
                <Select
                  options={LANGUAGE_OPTIONS}
                  value={language}
                  onChange={setLanguage}
                  placeholder="Any Language"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </div>
            </div>

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

export default GuideHeroSection;