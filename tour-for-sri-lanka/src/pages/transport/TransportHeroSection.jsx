import { Briefcase, Calendar, MapPin, Users } from "lucide-react";
import heroBg from "../../assets/transport/transport-bg.jpg"
import Select from "react-select"

const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
]
const districtOptions = districts.map((d) => ({ value: d, label: d}))
const passengerOptions = Array.from({ length: 15 }, (_, i) => i + 1).map((num) => ({
  value: num,
  label: `${num} ${num === 1 ? "Passenger" : "Passengers"}`,
}))
const bagsOptions = [
  { value: 1, label: "Small (1–2 bags)" },
  { value: 2, label: "Medium (2–4 bags)" },
  { value: 3, label: "Large (5–8 bags)" },
  { value: 4, label: "Extra Large / Storage" },
]

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  container: (base) => ({ ...base, width: "100%" }),
  control: (base) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "20px",
    backgroundColor: "#4A5C6A80",
    border: "none",
    boxShadow: "none",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
    color: "#CCD0CF",
    cursor: "pointer",
  }),
  menu: (base) => ({ ...base, backgroundColor: "#4A5C6A" }),
  singleValue: (base) => ({ ...base, color: "#CCD0CF", paddingLeft: "10px" }),
  placeholder: (base) => ({ ...base, color: "#CCD0CF", opacity: 0.5, paddingLeft: "10px" }),
  input: (base) => ({ ...base, color: "#CCD0CF" }),
};

export default function TransportHeroSection({ form, updateForm, onSearch }) {
  return (
    <section className="mt-6 pt-20 pb-24">
      <div
        className="relative h-[430px] rounded-[30px] overflow-visible bg-cover bg-center mx-5"
        style={{
          backgroundImage: `linear-gradient(rgba(7,25,35,.25), rgba(7,25,35,.55)), url(${heroBg})`,
        }}
      >
        {/* Hero Text */}
        <div className="absolute left-12 top-16 z-10">
          <h1 className="text-white text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Ride
          </h1>

          <p className="text-gray-300 text-lg mt-5">
            Discover and book the best vehicles with professional drivers
          </p>
        </div>

        {/* Search Box */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-5 z-20">
          <div className="bg-[#455766]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl h-[100px] grid grid-cols-[1.4fr_1fr_1fr_1fr_170px] items-center px-8">

            <SearchField icon={<MapPin size={24} />} label="Pick Up Location">
              <Select
                options={districtOptions}
                value={districtOptions.find((o) => o.value === form.pickupLocation) || null}
                onChange={(selected) => updateForm("pickupLocation", selected ? selected.value : "")}
                placeholder="Select District"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <SearchField icon={<Calendar size={24} />} label="Pick Up Date">
              <input
                type="date"
                value={form.pickupDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => updateForm("pickupDate", e.target.value)}
              />
            </SearchField>

            <SearchField icon={<Users size={24} />} label="Passengers">
              <Select
                options={passengerOptions}
                value={passengerOptions.find((o) => o.value === form.passengers) || null}
                onChange={(selected) => updateForm("passengers", selected ? selected.value : "")}
                placeholder="Select"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <SearchField icon={<Briefcase size={24} />} label="Bags">
              <Select
                options={bagsOptions}
                value={bagsOptions.find((o) => o.value === form.bags) || null}
                onChange={(selected) => updateForm("bags", selected ? selected.value : "")}
                placeholder="Select"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <button
              onClick={onSearch}
              className="ml-4 h-[52px] rounded-full bg-[#00C896] hover:bg-[#00b383] duration-300 text-white font-semibold flex items-center justify-center"
            >
              Search Vehicle
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}

function SearchField({ icon, label, children }) {
  return (
    <label className="relative px-4 border-r border-white/20 last:border-r-0">
      <div className="flex items-center gap-3">
        <span className="text-[#00C896]">{icon}</span>

        <div className="w-full">
          <small className="block text-sm text-gray-300">{label}</small>

          <div className="[&_select]:w-full [&_input]:w-full [&_select]:bg-transparent [&_input]:bg-transparent [&_select]:text-white [&_input]:text-white [&_select]:outline-none [&_input]:outline-none [&_select]:border-0 [&_input]:border-0 [&_option]:text-black">
            {children}
          </div>
        </div>
      </div>
    </label>
  );
}