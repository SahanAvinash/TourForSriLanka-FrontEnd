import {
  Briefcase,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import heroBg from "../../assets/transport/transport-bg.jpg";
import Select from "react-select";

const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const districtOptions = districts.map((district) => ({
  value: district,
  label: district,
}));

const passengerOptions = Array.from(
  { length: 15 },
  (_, i) => i + 1
).map((num) => ({
  value: num,
  label: `${num} ${num === 1 ? "Passenger" : "Passengers"}`,
}));

const bagsOptions = [
  { value: 1, label: "Small (1–2 bags)" },
  { value: 2, label: "Medium (2–4 bags)" },
  { value: 3, label: "Large (5–8 bags)" },
  { value: 4, label: "Extra Large / Storage" },
];

const selectStyles = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  container: (base) => ({
    ...base,
    width: "100%",
  }),

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
    backgroundColor: state.isFocused
      ? "#00C896"
      : "#4A5C6A",
    color: "#CCD0CF",
    cursor: "pointer",
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "#4A5C6A",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#CCD0CF",
    paddingLeft: "10px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#CCD0CF",
    opacity: 0.5,
    paddingLeft: "10px",
  }),

  input: (base) => ({
    ...base,
    color: "#CCD0CF",
  }),
};

export default function TransportHeroSection({
  form,
  updateForm,
  onSearch,
}) {
  return (
    <section className="mt-4 sm:mt-6 pt-20 sm:pt-24 pb-20 sm:pb-24">
      <div className="relative min-h-[650px] sm:min-h-[590px] lg:h-[430px] lg:min-h-0 rounded-[22px] sm:rounded-[30px] overflow-visible mx-3 sm:mx-5">

        <div
          className="hero-bg-anim absolute inset-0 rounded-[22px] sm:rounded-[30px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(
              rgba(7,25,35,.25),
              rgba(7,25,35,.55)
            ), url(${heroBg})`,
          }}
        />

        <div className="absolute left-5 sm:left-8 lg:left-12 top-10 sm:top-14 lg:top-16 z-10">
          <h1 className="hero-title-anim text-white text-[34px] sm:text-5xl lg:text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Ride
          </h1>

          <p className="hero-desc-anim text-gray-300 text-sm sm:text-base lg:text-lg mt-3 sm:mt-5 max-w-[500px]">
            Discover and book the best vehicles with professional drivers
          </p>
        </div>

        <div className="animate-box absolute top-[205px] sm:top-[230px] lg:-bottom-6 lg:top-auto left-3 right-3 sm:left-5 sm:right-5 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-auto lg:w-full lg:max-w-[1100px] px-0 lg:px-5 z-20">

          <div className="bg-[#455766]/75 sm:bg-[#455766]/80 backdrop-blur-xl rounded-[20px] sm:rounded-[28px] border border-white/10 shadow-2xl p-4 sm:p-5 lg:p-0 lg:h-[100px] flex flex-col lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_170px] lg:items-center lg:px-8">

            <SearchField
              icon={<MapPin size={21} />}
              label="Pick Up Location"
            >
              <Select
                options={districtOptions}
                value={
                  districtOptions.find(
                    (option) =>
                      option.value === form.pickupLocation
                  ) || null
                }
                onChange={(selected) =>
                  updateForm(
                    "pickupLocation",
                    selected ? selected.value : ""
                  )
                }
                placeholder="Select District"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <SearchField
              icon={<Calendar size={21} />}
              label="Pick Up Date"
            >
              <input
                type="date"
                value={form.pickupDate}
                min={new Date()
                  .toISOString()
                  .split("T")[0]}
                onChange={(e) =>
                  updateForm("pickupDate", e.target.value)
                }
                className="w-full bg-transparent text-white outline-none text-sm sm:text-base"
              />
            </SearchField>

            <SearchField
              icon={<Users size={21} />}
              label="Passengers"
            >
              <Select
                options={passengerOptions}
                value={
                  passengerOptions.find(
                    (option) =>
                      option.value === form.passengers
                  ) || null
                }
                onChange={(selected) =>
                  updateForm(
                    "passengers",
                    selected ? selected.value : ""
                  )
                }
                placeholder="Select"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <SearchField
              icon={<Briefcase size={21} />}
              label="Bags"
            >
              <Select
                options={bagsOptions}
                value={
                  bagsOptions.find(
                    (option) => option.value === form.bags
                  ) || null
                }
                onChange={(selected) =>
                  updateForm(
                    "bags",
                    selected ? selected.value : ""
                  )
                }
                placeholder="Select"
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </SearchField>

            <button
              onClick={onSearch}
              className="mt-4 lg:mt-0 lg:ml-4 h-[48px] sm:h-[52px] rounded-full bg-[#00C896] hover:bg-[#00b383] duration-300 text-white font-semibold flex items-center justify-center text-sm sm:text-base w-full"
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
    <label className="relative px-1 lg:px-4 py-3 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/10 lg:last:border-r-0">
      <div className="flex items-center gap-3">
        <span className="text-[#00C896] shrink-0">
          {icon}
        </span>

        <div className="w-full min-w-0">
          <small className="block text-xs sm:text-sm text-gray-300 mb-1">
            {label}
          </small>

          <div className="w-full [&_select]:w-full [&_input]:w-full [&_select]:bg-transparent [&_input]:bg-transparent [&_select]:text-white [&_input]:text-white [&_select]:outline-none [&_input]:outline-none [&_select]:border-0 [&_input]:border-0 [&_option]:text-black">
            {children}
          </div>
        </div>
      </div>
    </label>
  );
}