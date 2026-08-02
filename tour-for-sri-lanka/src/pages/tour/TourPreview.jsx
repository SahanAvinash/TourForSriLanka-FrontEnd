// pages/Tour/TourPreview.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Leaflet default marker icon eka bundler ekka break wena issue eka fix karanna
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Route order eka penna numbered custom marker ekak hadanawa
const createNumberedIcon = (number) => {
  return L.divIcon({
    className: "custom-numbered-marker",
    html: `<div style="
      background-color: #00C896;
      color: #11212D;
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
    ">
      <span style="transform: rotate(45deg); font-weight: bold; font-size: 14px;">${number}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Sri Lanka witharak penna map eka bound karanawa (wena countries epa)
const SRI_LANKA_BOUNDS = [
  [5.6, 79.3], // South-West corner
  [10.1, 82.1], // North-East corner
];

const FitRouteBounds = ({ positions }) => {
  const map = useMap();

  React.useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

const TourPreview = () => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Guide booking modal state ---
  const [activeGuideModal, setActiveGuideModal] = useState(null); // { location, guides }
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [tripGuestCount, setTripGuestCount] = useState(null); // TourPage eke user select kala number of guests eka methanata gennawa
  const [modalView, setModalView] = useState("list"); // "list" | "book"
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingForm, setBookingForm] = useState({
    date: "",
    durationType: "daily",
    quantity: 1,
    numberOfGuests: 1,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [startDistrict, setStartDistrict] = useState(null);

  // TourPage eke user select kala trip start date eka methanata gennawa
  const [tripStartDate, setTripStartDate] = useState("");

  useEffect(() => {
    const generateTrip = async () => {
      const saved = sessionStorage.getItem("TourBooking");
      if (!saved) {
        navigate("/tours/plan");
        return;
      }
      const { selectedDestinations, startDistrict } = JSON.parse(saved);
      setStartDistrict(startDistrict);

      // TourPage eke sessionStorage.setItem("tourStartDate", ...) karapu eka read karanawa
      const savedStartDate = sessionStorage.getItem("tourStartDate");
      if (savedStartDate) setTripStartDate(savedStartDate);

      const savedGuestCount = sessionStorage.getItem("tourNumberOfGuests");
      if (savedGuestCount) setTripGuestCount(Number(savedGuestCount));

      const destinationIds = selectedDestinations.map((d) => d.id);

      if (!startDistrict) {
        setError("Select your starting district first");
        setLoading(false);
        navigate("/tours");
        return;
      }

      try {
        const res = await axios.post("http://localhost:3000/api/tour/generate-trip", {
          destinationIds,
          startDistrict,
        });
        setTripData(res.data);
      } catch (err) {
        setError("");
      } finally {
        setLoading(false);
      }
    };

    generateTrip();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        Genarating your trip route...
      </div>
    );
  }

  if (error || !tripData) {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        {error || "Data eka load karanna bæri una"}
      </div>
    );
  }

  const { destinations, route, recommendations } = tripData;
  const routableStops = route.routableStops;
  const polylinePositions = route.geometry;
  const returnPolylinePositions = route.returnGeometry || [];
  const allMapPositions = [...polylinePositions, ...returnPolylinePositions];

  const centerLat =
    allMapPositions.reduce((sum, p) => sum + p[0], 0) / allMapPositions.length;
  const centerLng =
    allMapPositions.reduce((sum, p) => sum + p[1], 0) / allMapPositions.length;

  // --- Guide booking modal helpers ---
  const closeModal = () => {
    setActiveGuideModal(null);
    setModalView("list");
    setSelectedGuide(null);
    setShowPhoneNumber(false);
    setBookingError("")
    setBookingForm({ date: "", durationType: "daily", quantity: 1, numberOfGuests: 1, message: "" });
  };

  const totalPrice = selectedGuide ? bookingForm.quantity * selectedGuide.pricePerDay : 0;

  const handleBookingSubmit = async () => {
    setBookingError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if(!token){
        setBookingError("Please login as a traveler to book a guide");
    }
    try {
      setSubmitting(true);
      await axios.post(
        "http://localhost:3000/api/guidebooking",
        {
            guideId: selectedGuide._id,
            date: bookingForm.date,
            durationType: bookingForm.durationType,
            quantity: bookingForm.quantity,
            numberOfGuests: bookingForm.numberOfGuests,
            message: bookingForm.message,
            totalPrice,
        },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
      )
      closeModal();
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || "Something went wrong, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11212D] text-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Your Trip Route</h1>
      <p className="text-gray-400 mb-2">
        Total distance (round trip):{" "}
        <span className="text-[#00C896] font-semibold">{route.distanceKm} km</span>{" "}
        (straight-line estimate)
      </p>
      <div className="flex gap-5 mb-6 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-1 rounded-full" style={{ backgroundColor: "#00C896" }}></span>
          Outbound ({route.outboundDistanceKm} km)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-1 rounded-full" style={{ backgroundColor: "#FFB020" }}></span>
          Return to start ({route.returnDistanceKm} km)
        </span>
      </div>

      <div className="rounded-xl overflow-hidden mb-8" style={{ height: "450px" }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={8}
          minZoom={7}
          maxBounds={SRI_LANKA_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >
          <FitRouteBounds positions={allMapPositions} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {destinations.map((stop, index) => (
            <Marker
              key={stop.id || `stop-${index}`}
              position={[stop.latitude, stop.longitude]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <strong>{index + 1}. {stop.name}</strong><br />
                {stop.location}
              </Popup>
            </Marker>
          ))}
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#00C896",
              weight: 5,
            }}
          />
          {returnPolylinePositions.length > 0 && (
            <Polyline
              positions={returnPolylinePositions}
              pathOptions={{
                color: "#FFB020",
                weight: 5,
                dashArray: "8, 8",
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Trip Order</h2>
        <div className="flex flex-col gap-2">
          {destinations.map((dest, index) => (
            <div key={dest.id || `stop-${index}`} className="bg-[#253745] rounded-lg px-4 py-3 flex justify-between items-center">
              <span>
                {index + 1}. {dest.name} {dest.location && `(${dest.location})`}
              </span>
              {index === 0 && (
                <span className="text-sm text-gray-400">
                  Total : {route.distanceKm} km
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Nearby</h2>
        {recommendations.map((rec) => {
          const isStartLocation =
            rec.location?.toLowerCase().trim() === startDistrict?.toLowerCase().trim();

          return (
            <div key={rec.location} className="mb-6">
              <h3 className="text-[#00C896] font-semibold mb-2">{rec.location}</h3>
              <div className={`grid grid-cols-1 ${isStartLocation ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                {isStartLocation && (
                  <div
                    className="bg-[#253745] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                    onClick={() => setActiveGuideModal({ location: rec.location, guides: rec.guides })}
                  >
                    <p className="text-sm font-medium mb-1">Guides ({rec.guides.length})</p>
                    {rec.guides.slice(0, 2).map((g) => (
                      <p key={g._id} className="text-xs text-gray-400">{g.firstName} {g.lastName}</p>
                    ))}
                    {rec.guides.length > 2 && (
                      <p className="text-xs text-[#00C896] mt-1">+{rec.guides.length - 2} more · click to view</p>
                    )}
                  </div>
                )}
                <div className="bg-[#253745] rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Hotels ({rec.hotels.length})</p>
                  {rec.hotels.slice(0, 2).map((h) => (
                    <p key={h._id} className="text-xs text-gray-400">{h.hotelName}</p>
                  ))}
                </div>
                <div className="bg-[#253745] rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Transport ({rec.transports.length})</p>
                  {rec.transports.slice(0, 2).map((t) => (
                    <p key={t._id} className="text-xs text-gray-400">{t.vehicleBrand} {t.vehicleModel}</p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeGuideModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={closeModal}>
          <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#00C896]">
                {modalView === "list" ? `Guides — ${activeGuideModal.location}` : "Book a Guide"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
            </div>

            {modalView === "list" && (
              <div className="flex flex-col gap-3">
                {activeGuideModal.guides.map((g) => (
                  <div key={g._id} className="bg-[#1a2530] rounded-[14px] p-3 flex items-center gap-3">
                    <img
                      src={g.profilePic || "/guide_placeholder.jpg"}
                      alt={`${g.firstName} ${g.lastName}`}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-white font-semibold text-sm truncate">{g.firstName} {g.lastName}</h4>
                        <span className="text-[10px] text-[#00C896] bg-[#00C896]/10 px-[8px] py-[2px] rounded-full whitespace-nowrap">
                          {g.yearsOfExperience}+ yrs
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-[4px]">
                        <FaMapMarkerAlt className="text-[#00C896] text-[12px]" />
                        <span className="truncate">{g.district}</span>
                      </div>
                      <p className="text-[#00C896] font-bold text-[13px] mt-[4px]">{g.currency} {g.pricePerDay}/day</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGuide(g);
                        setBookingForm({
                          ...bookingForm,
                          durationType: "daily",
                          quantity: destinations.length,
                          date: tripStartDate || bookingForm.date,
                          numberOfGuests: tripGuestCount || bookingForm.numberOfGuests,
                        });
                        setModalView("book");
                      }}
                      className="border border-[#00C896] text-[#00C896] px-[14px] py-[7px] rounded-full text-[12px] hover:bg-[#00C896] hover:text-white transition-all duration-300 flex-shrink-0"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            )}

            {modalView === "book" && selectedGuide && (
              <div>
                <button
                  onClick={() => { setModalView("list"); setShowPhoneNumber(false); }}
                  className="text-xs text-gray-400 mb-3"
                >
                  ← Back to guides
                </button>

                <div className="flex items-center gap-3 mb-4 relative">
                  <img src={selectedGuide.profilePic} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{selectedGuide.firstName} {selectedGuide.lastName}</p>
                    <p className="text-xs text-gray-400">{selectedGuide.yearsOfExperience} yrs experience</p>
                  </div>
                  <button
                    onClick={() => setShowPhoneNumber((prev) => !prev)}
                    title="Show phone number"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#00C896] text-[#00C896] hover:bg-[#00C896] hover:text-white transition-colors flex-shrink-0"
                  >
                    <FaPhoneAlt size={13} />
                  </button>

                  {showPhoneNumber && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowPhoneNumber(false)} />
                      <div className="absolute right-0 top-11 z-50 bg-[#1a2530] border border-[#00C896]/30 rounded-lg shadow-lg p-3 w-52">
                        <p className="text-[11px] text-gray-400 mb-2">{selectedGuide.firstName}'s mobile number</p>
                        <a
                          href={`tel:${selectedGuide.mobile}`}
                          className="flex items-center justify-center gap-2 bg-[#11212D] rounded-md py-2 text-sm text-[#00C896] font-medium hover:bg-[#00C896]/10 transition-colors"
                        >
                          <FaPhoneAlt size={11} />
                          {selectedGuide.mobile}
                        </a>
                        <p className="text-[10px] text-gray-500 mt-1.5 text-center">Tap number to call</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => {
                        if (!tripStartDate) setBookingForm({ ...bookingForm, date: e.target.value });
                      }}
                      readOnly={!!tripStartDate}
                      onKeyDown={(e) => {
                        if (tripStartDate) e.preventDefault();
                      }}
                      style={{ colorScheme: "dark" }}
                      className={`w-full rounded-md px-3 py-2 text-sm outline-none text-white ${
                        tripStartDate
                          ? "bg-[#1a2530] border border-white/5 cursor-not-allowed"
                          : "bg-[#253745]"
                      }`}
                    />
                    {tripStartDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Locked to your trip start date. Go back to the Tour Planner page to change it.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Number of Days <span className="text-gray-500">(LKR {selectedGuide.pricePerDay}/day)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bookingForm.quantity}
                      onChange={(e) => setBookingForm({ ...bookingForm, quantity: Number(e.target.value) })}
                      className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pre-filled based on your {destinations.length}-destination trip — edit if needed.</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Guests (max {selectedGuide.maximumGuests})</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedGuide.maximumGuests}
                      value={bookingForm.numberOfGuests}
                      onChange={(e) => {
                        if (!tripGuestCount) setBookingForm({ ...bookingForm, numberOfGuests: Number(e.target.value) });
                      }}
                      readOnly={!!tripGuestCount}
                      onKeyDown={(e) => {
                        if (tripGuestCount) e.preventDefault();
                      }}
                      className={`w-full rounded-md px-3 py-2 text-sm outline-none text-white ${
                        tripGuestCount
                          ? "bg-[#1a2530] border border-white/5 cursor-not-allowed"
                          : "bg-[#253745]"
                      }`}
                    />
                    {tripGuestCount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Locked to your trip guest count. Go back to the Tour Planner page to change it.
                      </p>
                    )}
                    {bookingForm.numberOfGuests > selectedGuide.maximumGuests && (
                      <p className="text-xs text-red-400 mt-1">
                        Exceeds guide's maximum capacity. Please reduce the number of guests.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Message (optional)</label>
                    <textarea
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      rows={2}
                      className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-lg font-semibold text-[#00C896]">
                      {selectedGuide.currency} {totalPrice.toLocaleString()}
                    </span>
                  </div>
                    {bookingError && (
                        <p className="text-xs text-red-400 -mt-1">{bookingError}</p>
                    )}
                  <button
                    onClick={handleBookingSubmit}
                    disabled={submitting || !bookingForm.date || bookingForm.numberOfGuests > selectedGuide.maximumGuests}
                    className="w-full bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Booking Request"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPreview;
