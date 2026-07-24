import { Briefcase, Calendar, Car, MapPin, Plane, Users } from "lucide-react";
import heroBg from "../../assets/transport/transport-bg.jpg"

export default function TransportHeroSection({
  service,
  setService,
  form,
  updateForm,
  onSearch,
}) {
  return (
    <section className="px-8 mt-6 pb-24">
      <div
        className="relative h-[430px] rounded-[30px] overflow-visible bg-cover bg-center"
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

        {/* Service Tabs */}
        <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-5">
          <div className="grid grid-cols-4 bg-[#455766]/80 backdrop-blur-xl rounded-t-[28px] overflow-hidden border border-white/10">
            <ServiceTab
              active={service === "airport-pickup"}
              onClick={() => setService("airport-pickup")}
              icon={<Plane size={18} />}
              text="Airport Pickup"
            />

            <ServiceTab
              active={service === "airport-drop"}
              onClick={() => setService("airport-drop")}
              icon={<Plane size={18} />}
              text="Airport Drop"
            />

            <ServiceTab
              active={service === "ride-now"}
              onClick={() => setService("ride-now")}
              icon={<Car size={18} />}
              text="Ride Now"
            />

            <ServiceTab
              active={service === "tours"}
              onClick={() => setService("tours")}
              icon={<Car size={18} />}
              text="Tours"
            />
          </div>
        </div>

        {/* Search Box */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-5 z-20">
          <div className="bg-[#455766]/80 backdrop-blur-xl rounded-b-[28px] border border-white/10 shadow-2xl h-[100px] grid grid-cols-[1.4fr_1fr_1fr_1fr_170px] items-center px-8">

            <SearchField
              icon={<MapPin size={24} />}
              label="Pick Up Location"
            >
              <select
                value={form.pickupLocation}
                onChange={(e) =>
                  updateForm("pickupLocation", e.target.value)
                }
              >
                <option>Colombo, Sri Lanka</option>
                <option>Bandaranaike Airport</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Ella</option>
                <option>Sigiriya</option>
              </select>
            </SearchField>

            <SearchField
              icon={<Calendar size={24} />}
              label="Pick Up Date"
            >
              <input
                type="date"
                value={form.pickupDate}
                onChange={(e) =>
                  updateForm("pickupDate", e.target.value)
                }
              />
            </SearchField>

            <SearchField
              icon={<Users size={24} />}
              label="Passengers"
            >
              <select
                value={form.passengers}
                onChange={(e) =>
                  updateForm("passengers", e.target.value)
                }
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="4">4 Passengers</option>
                <option value="10">10 Passengers</option>
                <option value="30">30 Passengers</option>
              </select>
            </SearchField>

            <SearchField
              icon={<Briefcase size={24} />}
              label="Bags"
            >
              <select
                value={form.bags}
                onChange={(e) =>
                  updateForm("bags", e.target.value)
                }
              >
                <option>1 to 2 bags</option>
                <option>3 to 5 bags</option>
                <option>6 to 10 bags</option>
                <option>10+ bags</option>
              </select>
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

function ServiceTab({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-4 transition duration-300 font-medium ${
        active
          ? "bg-[#00C896]/20 text-[#00C896]"
          : "text-white hover:bg-white/10"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}

function SearchField({ icon, label, children }) {
  return (
    <label className="relative px-4 border-r border-white/20 last:border-r-0">
      <div className="flex items-center gap-3">
        <span className="text-[#00C896]">{icon}</span>

        <div className="w-full">
          <small className="block text-sm text-gray-300">
            {label}
          </small>

          <div className="[&_select]:w-full [&_input]:w-full [&_select]:bg-transparent [&_input]:bg-transparent [&_select]:text-white [&_input]:text-white [&_select]:outline-none [&_input]:outline-none [&_select]:border-0 [&_input]:border-0 [&_option]:text-black">
            {children}
          </div>
        </div>
      </div>
    </label>
  );
}