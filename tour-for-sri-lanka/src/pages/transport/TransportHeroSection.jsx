import { Briefcase, Calendar, MapPin, Users } from "lucide-react";
import Select from "react-select";
import heroBg from "../../assets/transport/transport-bg.jpg";

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

const passengerOptions = Array.from({ length: 15 }, (_, index) => {
  const value = index + 1;

  return {
    value,
    label: `${value} ${value === 1 ? "Passenger" : "Passengers"}`,
  };
});

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
    backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
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
    <section className="mt-6 pt-20 pb-28 sm:pb-24">
      <div className="relative mx-3 sm:mx-5 h-[650px] sm:h-[570px] lg:h-[430px] rounded-[22px] sm:rounded-[30px] overflow-visible">
        <div
          className="hero-bg-anim absolute inset-0 rounded-[22px] sm:rounded-[30px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              rgba(7,25,35,0.18) 0%,
              rgba(7,25,35,0.25) 35%,
              rgba(7,25,35,0.50) 65%,
              rgba(7,25,35,0.88) 88%,
              #071923 100%
            ), url(${heroBg})`,
          }}
        />

        <div className="absolute left-0 right-0 bottom-0 h-[260px] sm:h-[230px] lg:h-[190px] rounded-b-[22px] sm:rounded-b-[30px] pointer-events-none bg-gradient-to-b from-transparent via-[#071923]/45 to-[#071923]" />

        <div className="absolute left-5 sm:left-10 lg:left-12 top-10 sm:top-14 lg:top-16 z-10">
          <h1 className="hero-title-anim text-white text-[34px] sm:text-5xl lg:text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Ride
          </h1>

          <p className="hero-desc-anim text-gray-300 text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 lg:mt-5">
            Discover and book the best vehicles with professional drivers
          </p>
        </div>

        <div className="animate-box absolute top-[205px] sm:top-[220px] lg:top-auto lg:-bottom-6 left-3 right-3 sm:left-8 sm:right-8 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-auto lg:w-full lg:max-w-[1100px] z-20">
          <div className="bg-[#455766]/85 backdrop-blur-xl rounded-[20px] sm:rounded-[26px] lg:rounded-[28px] border border-white/10 shadow-2xl p-4 sm:p-5 lg:p-0 lg:h-[100px] flex flex-col lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_170px] lg:items-center lg:px-8">
            <SearchField
              icon={<MapPin size={22} />}
              label="Pick Up Location"
            >
              <Select
                options={districtOptions}
                value={
                  districtOptions.find(
                    (option) => option.value === form.pickupLocation
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

            <div className="lg:hidden h-px w-full bg-white/10 my-3" />

            <SearchField
              icon={<Calendar size={22} />}
              label="Pick Up Date"
            >
              <input
                type="date"
                value={form.pickupDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) =>
                  updateForm("pickupDate", event.target.value)
                }
              />
            </SearchField>

            <div className="lg:hidden h-px w-full bg-white/10 my-3" />

            <SearchField
              icon={<Users size={22} />}
              label="Passengers"
            >
              <Select
                options={passengerOptions}
                value={
                  passengerOptions.find(
                    (option) => option.value === form.passengers
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

            <div className="lg:hidden h-px w-full bg-white/10 my-3" />

            <SearchField
              icon={<Briefcase size={22} />}
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
              type="button"
              onClick={onSearch}
              className="mt-4 lg:mt-0 lg:ml-4 h-[50px] sm:h-[52px] rounded-full bg-[#00C896] hover:bg-[#00b383] duration-300 text-white font-semibold flex items-center justify-center w-full lg:w-auto whitespace-nowrap"
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
    <div className="relative lg:px-4 lg:border-r lg:border-white/20 lg:last:border-r-0">
      <div className="flex items-center gap-3">
        <span className="text-[#00C896] shrink-0">{icon}</span>

        <div className="w-full min-w-0">
          <small className="block text-xs sm:text-sm text-gray-300 mb-1">
            {label}
          </small>

          <div className="[&_select]:w-full [&_input]:w-full [&_select]:bg-transparent [&_input]:bg-transparent [&_select]:text-white [&_input]:text-white [&_select]:outline-none [&_input]:outline-none [&_select]:border-0 [&_input]:border-0 [&_option]:text-black text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}