import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import TransportHeroSection from "./TransportHeroSection";
import VehicleTypeCard from "./VehicleTypeCard";
import { vehicleTypes } from "../../data/vehicles";
import Navbar from "../../components/Navbar";

export default function TransportPage() {
  const navigate = useNavigate();
  const vehicleTypeSectionRef = useRef(null);

  const [service, setService] = useState("airport-pickup");
  const [form, setForm] = useState({
    pickupLocation: "",
    pickupDate: "",
    passengers: "",
    bags: "",
  });

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openVehicles = (type) => {
    const params = new URLSearchParams({
      service,
      pickupLocation: form.pickupLocation,
      pickupDate: form.pickupDate,
      passengers: form.passengers,
      bags: form.bags,
    });

    navigate(`/transport/vehicles/${type}?${params.toString()}`);
  };

  const handleSearch = () => {
    vehicleTypeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#071923] text-white">
      <Navbar/>
      <TransportHeroSection
        service={service}
        setService={setService}
        form={form}
        updateForm={updateForm}
        onSearch={handleSearch}
      />

      <section ref={vehicleTypeSectionRef} className="px-14 py-8 max-lg:px-5">
        <h2 className="text-[22px] font-bold">Select your vehicle type</h2>
        <p className="mt-1 text-[#d5dde2]">
          All vehicles are with professional drivers
        </p>

        <div className="mt-3.5 grid grid-cols-4 gap-[62px] max-lg:grid-cols-1 max-lg:gap-6">
          {vehicleTypes.map((item) => (
            <VehicleTypeCard
              key={item.type}
              item={item}
              onClick={() => openVehicles(item.type)}
            />
          ))}
        </div>
      </section>

      <Footer/>
    </main>
  );
}