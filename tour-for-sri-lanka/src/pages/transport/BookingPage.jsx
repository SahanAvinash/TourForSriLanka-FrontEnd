import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Users, Briefcase, MapPin, Phone, Mail } from "lucide-react";
import Select from "react-select";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import TransportReviews from "./TransportReviews";
import MapPickerModal from "../../components/MapPickerModal";

const passengerOptions = Array.from({ length: 15 }, (_, i) => i + 1).map(
  (num) => ({
    value: num,
    label: `${num} ${num === 1 ? "Passenger" : "Passengers"}`,
  })
);

const luggageByVehicle = {
  car: [
    { value: 1, label: "Small (1 bag)" },
    { value: 2, label: "Medium (2 bags)" },
  ],
  van: [
    { value: 2, label: "Medium (2–4 bags)" },
    { value: 3, label: "Large (5–8 bags)" },
  ],
  bus: [
    { value: 3, label: "Medium storage" },
    { value: 4, label: "Large storage" },
  ],
  jeep: [{ value: 1, label: "Small (1–2 bags)" }],
};

const selectStyles = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),

  container: (base) => ({
    ...base,
    width: "100%",
    minWidth: 0,
  }),

  control: (base) => ({
    ...base,
    minHeight: "42px",
    height: "42px",
    width: "100%",
    borderRadius: "12px",
    backgroundColor: "#4A5C6A80",
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
    overflow: "hidden",
  }),

  valueContainer: (base) => ({
    ...base,
    minWidth: 0,
    padding: "0 12px",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
    color: "#CCD0CF",
    cursor: "pointer",
    padding: "10px 12px",
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "#4A5C6A",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "4px",
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
    margin: 0,
    whiteSpace: "nowrap",
  }),

  input: (base) => ({
    ...base,
    color: "#CCD0CF",
    margin: 0,
    padding: 0,
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#CCD0CF",
    padding: "6px",
    flexShrink: 0,
    "&:hover": {
      color: "#00C896",
    },
  }),

  indicatorsContainer: (base) => ({
    ...base,
    flexShrink: 0,
  }),
};

export default function BookingPage() {
  const { vehicleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const vehicle = location.state?.vehicle;
  const searchContext = location.state?.searchContext;

  const luggageOptions =
    luggageByVehicle[vehicle?.vehicleType?.toLowerCase()] || [];

  const storedUser = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
  );

  const travelerId = storedUser?._id;

  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropoffCoordinates, setDropoffCoordinates] = useState(null);
  const [mapPickerTarget, setMapPickerTarget] = useState(null);

  const [form, setForm] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: searchContext?.pickupDate || "",
    returnDate: "",
    numberOfPassengers: searchContext?.numberOfPassengers || "",
    bags: searchContext?.bags || "",
  });

  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmLocation = (picked) => {
    if (mapPickerTarget === "pickup") {
      updateForm("pickupLocation", picked.address);
      setPickupCoordinates({
        lat: picked.lat,
        lng: picked.lng,
      });
    }

    if (mapPickerTarget === "dropoff") {
      updateForm("dropoffLocation", picked.address);
      setDropoffCoordinates({
        lat: picked.lat,
        lng: picked.lng,
      });
    }

    setMapPickerTarget(null);
  };

  useEffect(() => {
    const allFieldsFilled =
      form.pickupLocation &&
      pickupCoordinates &&
      form.dropoffLocation &&
      dropoffCoordinates &&
      form.pickupDate &&
      (!isReturnTrip || form.returnDate) &&
      form.numberOfPassengers &&
      form.bags;

    if (!allFieldsFilled) {
      setEstimate(null);
      return;
    }

    const fetchEstimate = async () => {
      setEstimating(true);

      try {
        const params = new URLSearchParams({
          vehicleId,
          pickupLat: pickupCoordinates.lat,
          pickupLng: pickupCoordinates.lng,
          dropoffLat: dropoffCoordinates.lat,
          dropoffLng: dropoffCoordinates.lng,
          isReturnTrip: isReturnTrip,
        });

        const res = await fetch(
          `${API_BASE_URL}/api/transport/booking-estimate?${params}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Could not calculate estimate"
          );
        }

        setEstimate(data);
      } catch (err) {
        toast.error(err.message);
        setEstimate(null);
      } finally {
        setEstimating(false);
      }
    };

    fetchEstimate();
  }, [
    form.pickupLocation,
    pickupCoordinates,
    form.dropoffLocation,
    dropoffCoordinates,
    form.pickupDate,
    form.returnDate,
    form.numberOfPassengers,
    form.bags,
    isReturnTrip,
    vehicleId,
  ]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/transport-review/vehicle/${vehicleId}`
        );

        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (vehicleId) {
      fetchReviews();
    }
  }, [vehicleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!travelerId) {
      toast.error("Please log in to book a vehicle");
      navigate("/login");
      return;
    }

    if (
      !form.pickupLocation ||
      !pickupCoordinates ||
      !form.dropoffLocation ||
      !dropoffCoordinates ||
      !form.pickupDate ||
      (isReturnTrip && !form.returnDate) ||
      !form.numberOfPassengers ||
      !form.bags
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/transport/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleId,
            travelerId,
            ...form,
            pickupLat: pickupCoordinates.lat,
            pickupLng: pickupCoordinates.lng,
            dropoffLat: dropoffCoordinates.lat,
            dropoffLng: dropoffCoordinates.lng,
            isReturnTrip,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Booking failed");
      }

      toast.success(
        "Booking request sent to the vehicle owner!"
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-[#071923] text-white flex flex-col">
        <Navbar />

        <section className="px-5 sm:px-8 lg:px-14 pt-28 pb-16 flex-1">
          <p className="text-[#d5dde2]">
            Vehicle details not found. Please go back and select a
            vehicle again.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[#00C896] hover:underline"
          >
            &larr; Back
          </button>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071923] text-white flex flex-col">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-14 pt-28 pb-12 sm:pb-16 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="text-[#00C896] text-sm mb-5 hover:underline"
        >
          &larr; Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-5 sm:space-y-6">

            <div className="booking-vehicle-anim bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-3 sm:p-4 border border-white/10">

              <img
                src={vehicle.addVehiclePhotos?.[0]}
                alt={`${vehicle.vehicleBrand} ${vehicle.vehicleModel}`}
                className="w-full h-44 sm:h-52 lg:h-48 object-cover rounded-[12px] sm:rounded-[14px]"
              />

              <h2 className="text-lg sm:text-xl font-bold mt-4">
                {vehicle.vehicleBrand} {vehicle.vehicleModel}
              </h2>

              <p className="text-xs sm:text-sm text-[#d5dde2] mt-1 leading-relaxed">
                {vehicle.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs sm:text-sm text-[#d5dde2]">
                <span className="flex items-center gap-1">
                  <Users size={15} />
                  {vehicle.passengerCapacity}
                </span>

                <span className="flex items-center gap-1">
                  <Briefcase size={15} />
                  {vehicle.luggageCapacity}
                </span>

                <span className="flex items-center gap-1 min-w-0">
                  <MapPin size={15} className="shrink-0" />
                  <span className="truncate">
                    {vehicle.availableArea?.join(", ")}
                  </span>
                </span>
              </div>
            </div>

            <div className="booking-owner-anim bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-[#d5dde2] mb-3">
                Vehicle Owner
              </h3>

              <div className="flex items-center gap-3 min-w-0">
                {vehicle.profilePhoto && (
                  <img
                    src={vehicle.profilePhoto}
                    alt={vehicle.firstName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                  />
                )}

                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {vehicle.firstName} {vehicle.lastName}
                  </p>

                  {vehicle.mobile && (
                    <p className="text-xs text-[#d5dde2] flex items-center gap-1 mt-1 truncate">
                      <Phone size={12} className="shrink-0" />
                      {vehicle.mobile}
                    </p>
                  )}

                  {vehicle.email && (
                    <p className="text-xs text-[#d5dde2] flex items-center gap-1 truncate">
                      <Mail size={12} className="shrink-0" />
                      {vehicle.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOOKING FORM */}
          <form
            onSubmit={handleSubmit}
            className="booking-form-anim bg-[#1B2B34] rounded-[18px] sm:rounded-[20px] p-4 sm:p-6 border border-white/10 space-y-4 h-fit min-w-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold">
                Book this vehicle
              </h2>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsReturnTrip(false);
                    updateForm("returnDate", "");
                  }}
                  className={`h-[32px] px-4 rounded-full font-semibold text-xs transition flex-1 sm:flex-none ${
                    !isReturnTrip
                      ? "bg-[#00C896] text-white"
                      : "bg-[#4A5C6A80] text-[#d5dde2]"
                  }`}
                >
                  One Way
                </button>

                <button
                  type="button"
                  onClick={() => setIsReturnTrip(true)}
                  className={`h-[32px] px-4 rounded-full font-semibold text-xs transition flex-1 sm:flex-none ${
                    isReturnTrip
                      ? "bg-[#00C896] text-white"
                      : "bg-[#4A5C6A80] text-[#d5dde2]"
                  }`}
                >
                  Round Trip
                </button>
              </div>
            </div>

            {/* PICKUP */}
            <div>
              <label className="block text-sm text-[#d5dde2] mb-1">
                Pickup Location
              </label>

              <div className="relative">
                <input
                  readOnly
                  value={form.pickupLocation}
                  onClick={() => setMapPickerTarget("pickup")}
                  placeholder="Click to pick location on map"
                  className="w-full h-[42px] bg-[#4A5C6A80] rounded-[12px] px-4 pr-10 outline-none cursor-pointer text-sm min-w-0"
                />

                <MapPin
                  size={16}
                  onClick={() => setMapPickerTarget("pickup")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00C896] cursor-pointer"
                />
              </div>
            </div>

            {/* DROP OFF */}
            <div>
              <label className="block text-sm text-[#d5dde2] mb-1">
                Drop-off Location
              </label>

              <div className="relative">
                <input
                  readOnly
                  value={form.dropoffLocation}
                  onClick={() => setMapPickerTarget("dropoff")}
                  placeholder="Click to pick location on map"
                  className="w-full h-[42px] bg-[#4A5C6A80] rounded-[12px] px-4 pr-10 outline-none cursor-pointer text-sm min-w-0"
                />

                <MapPin
                  size={16}
                  onClick={() => setMapPickerTarget("dropoff")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00C896] cursor-pointer"
                />
              </div>
            </div>

            {/* DATES */}
            <div
              className={`grid gap-4 ${
                isReturnTrip
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <label className="block text-sm text-[#d5dde2] mb-1">
                  Pickup Date
                </label>

                <div className="w-full min-w-0 overflow-hidden rounded-[12px]">
                  <input
                    type="date"
                    value={form.pickupDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      updateForm("pickupDate", e.target.value)
                    }
                    className="
                      block
                      w-full
                      max-w-full
                      min-w-0
                      h-[42px]
                      bg-[#4A5C6A80]
                      rounded-[12px]
                      px-3
                      sm:px-4
                      py-2
                      outline-none
                      text-sm
                      text-white
                      appearance-none
                    "
                  />
                </div>
              </div>

              {isReturnTrip && (
                <div className="min-w-0 overflow-hidden">
                  <label className="block text-sm text-[#d5dde2] mb-1">
                    Return Date
                  </label>

                  <div className="w-full min-w-0 overflow-hidden rounded-[12px]">
                    <input
                      type="date"
                      value={form.returnDate}
                      min={
                        form.pickupDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        updateForm("returnDate", e.target.value)
                      }
                      className="
                        block
                        w-full
                        max-w-full
                        min-w-0
                        h-[42px]
                        bg-[#4A5C6A80]
                        rounded-[12px]
                        px-3
                        sm:px-4
                        py-2
                        outline-none
                        text-sm
                        text-white
                        appearance-none
                      "
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PASSENGERS + BAGS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">

              <div className="min-w-0">
                <label className="block text-sm text-[#d5dde2] mb-1">
                  Passengers
                </label>

                <Select
                  options={passengerOptions}
                  value={
                    passengerOptions.find(
                      (o) =>
                        Number(o.value) ===
                        Number(form.numberOfPassengers)
                    ) || null
                  }
                  onChange={(selected) =>
                    updateForm(
                      "numberOfPassengers",
                      selected ? selected.value : ""
                    )
                  }
                  placeholder="Select passengers"
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-sm text-[#d5dde2] mb-1">
                  Bags
                </label>

                <Select
                  options={luggageOptions}
                  value={
                    luggageOptions.find(
                      (o) =>
                        Number(o.value) === Number(form.bags)
                    ) || null
                  }
                  onChange={(selected) =>
                    updateForm(
                      "bags",
                      selected ? selected.value : ""
                    )
                  }
                  placeholder="Select bag capacity"
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            {/* ESTIMATE */}
            {estimating && (
              <p className="text-sm text-[#d5dde2]">
                Calculating distance & price...
              </p>
            )}

            {estimate && !estimating && (
              <div className="bg-[#4A5C6A80] rounded-[12px] p-4 space-y-1">
                <div className="flex justify-between text-sm text-[#d5dde2] gap-4">
                  <span>Distance</span>
                  <span>{estimate.distanceKm} km</span>
                </div>

                <div className="flex justify-between font-semibold text-[#00C896] gap-4">
                  <span>Total Price</span>
                  <span>
                    Rs. {estimate.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !estimate}
              className="w-full h-[48px] rounded-full bg-[#00C896] hover:bg-[#00b383] disabled:opacity-50 text-white font-semibold transition"
            >
              {submitting
                ? "Booking..."
                : "Request Booking"}
            </button>
          </form>
        </div>

        {/* REVIEWS */}
        <section className="booking-reviews-anim mt-8 sm:mt-10">
          {loadingReviews ? (
            <p className="text-sm text-[#d5dde2]">
              Loading reviews...
            </p>
          ) : (
            <TransportReviews
              vehicleId={vehicleId}
              reviews={reviews}
              onReviewAdded={(review, isUpdate) => {
                setReviews((prev) =>
                  isUpdate
                    ? prev.map((r) =>
                        r._id === review._id ? review : r
                      )
                    : [review, ...prev]
                );
              }}
              onReviewDeleted={(id) =>
                setReviews((prev) =>
                  prev.filter((r) => r._id !== id)
                )
              }
            />
          )}
        </section>
      </section>

      <Footer />

      {mapPickerTarget && (
        <MapPickerModal
          initialPosition={
            mapPickerTarget === "pickup"
              ? pickupCoordinates
              : dropoffCoordinates
          }
          title={
            mapPickerTarget === "pickup"
              ? "Pick your pickup location"
              : "Pick your drop-off location"
          }
          onClose={() => setMapPickerTarget(null)}
          onConfirm={handleConfirmLocation}
        />
      )}
    </main>
  );
}