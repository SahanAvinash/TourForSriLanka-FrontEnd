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
    padding: "0",
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
    padding: 0,
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

export default function TransportHeroSection({
  form,
  updateForm,
  onSearch,
}) {
  return (
    <section className="relative pt-24 sm:pt-28 bg-[#11212D]">
      <div className="relative min-h-[720px] sm:min-h-[620px] lg:h-[430px] lg:min-h-0">
        <div className="absolute inset-x-2 sm:inset-x-4 top-0 bottom-0 rounded-[20px] sm:rounded-[30px] overflow-hidden">
          <img
            src={heroBg}
            alt="Transport"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-x-0 bottom-0 h-[330px] sm:h-[280px] lg:h-[190px] bg-gradient-to-b from-transparent via-[#11212D]/70 to-[#11212D]" />

          <div className="absolute inset-x-0 bottom-0 h-[100px] sm:h-[90px] lg:h-[70px] bg-gradient-to-b from-transparent to-[#11212D]" />
        </div>

        <div className="absolute left-5 right-5 sm:left-10 sm:right-10 lg:left-12 lg:right-auto top-10 sm:top-16 z-10">
          <h1 className="hero-title-anim text-white text-[32px] sm:text-5xl lg:text-6xl font-bold leading-tight">
            Find your Perfect
            <br />
            Ride
          </h1>

          <p className="hero-desc-anim text-gray-300 text-sm sm:text-lg mt-3 sm:mt-5 max-w-md">
            Discover and book the best vehicles with professional drivers
          </p>
        </div>

        <div className="animate-box absolute top-[205px] sm:top-[235px] lg:-bottom-12 lg:top-auto left-3 right-3 sm:left-8 sm:right-8 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-auto lg:w-full lg:max-w-[1100px] z-20">
          <div className="bg-[#455766]/40 sm:bg-[#455766]/45 lg:bg-[#455766]/55 backdrop-blur-xl rounded-[20px] sm:rounded-[28px]  shadow-2xl p-4 sm:p-6 lg:p-0 lg:h-[100px] flex flex-col lg:flex-row lg:items-center lg:px-8">

            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <MapPin
                size={22}
                className="text-[#00C896] shrink-0"
              />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Choose your
                </label>

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
                  placeholder="Pick Up Location"
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  menuPortalTarget={
                    typeof document !== "undefined"
                      ? document.body
                      : null
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-white/20 mx-4" />

            <div className="lg:hidden h-px w-full bg-white/10 my-4" />

            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <Calendar
                size={22}
                className="text-[#00C896] shrink-0"
              />

              <div className="w-full min-w-0">
                <label className="text-sm text-gray-300">
                  Pick Up Date
                </label>

                <input
                  type="date"
                  value={form.pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    updateForm("pickupDate", e.target.value)
                  }
                  className="w-full bg-transparent text-white [color-scheme:dark] outline-none mt-1 text-sm sm:text-base min-w-0"
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-white/20 mx-4" />

            <div className="lg:hidden h-px w-full bg-white/10 my-4" />

            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <Users
                size={22}
                className="text-[#00C896] shrink-0"
              />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Passengers
                </label>

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
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  menuPortalTarget={
                    typeof document !== "undefined"
                      ? document.body
                      : null
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-white/20 mx-4" />

            <div className="lg:hidden h-px w-full bg-white/10 my-4" />

            <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
              <Briefcase
                size={22}
                className="text-[#00C896] shrink-0"
              />

              <div className="w-full min-w-0">
                <label className="block text-sm text-gray-300 mb-0.5">
                  Bags
                </label>

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
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  menuPortalTarget={
                    typeof document !== "undefined"
                      ? document.body
                      : null
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onSearch}
              className="mt-4 lg:mt-0 lg:ml-6 bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-6 sm:px-8 py-3.5 rounded-full flex items-center justify-center gap-2 font-semibold w-full lg:w-auto whitespace-nowrap text-sm sm:text-base"
            >
              Search Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="h-[70px] sm:h-[80px] lg:h-[100px] bg-[#11212D]" />
    </section>
  );
}