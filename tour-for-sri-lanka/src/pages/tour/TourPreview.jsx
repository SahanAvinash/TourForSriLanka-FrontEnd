import { API_BASE_URL } from "../../config/api";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle, FaShoppingCart, FaTrash, FaPlay, FaRoute, FaClock, FaRulerHorizontal, FaMapMarkedAlt, FaUserTie, FaHotel, FaCar } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTrip } from "../../context/TripContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const createStartIcon = () => {
  return L.divIcon({
    className: "custom-start-marker",
    html: `<div style="
      background-color: #FFB020;
      color: #11212D;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      font-weight: bold;
      font-size: 12px;
    ">S</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

const getCoordFromStop = (stop) => {
  if (!stop) return null;
  if (Array.isArray(stop) && stop.length >= 2) return [stop[0], stop[1]];
  if (stop.lat != null && stop.lng != null) return [stop.lat, stop.lng];
  if (stop.latitude != null && stop.longitude != null) return [stop.latitude, stop.longitude];
  if (stop.location?.lat != null && stop.location?.lng != null) return [stop.location.lat, stop.location.lng];
  return null;
};

const SRI_LANKA_BOUNDS = [
  [5.6, 79.3],
  [10.1, 82.1],
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

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ROUTE_OPTION_META = {
  shortestDistance: {
    icon: FaRulerHorizontal,
    tagline: "All your selected destinations — we calculate how many days you'll need.",
  },
  fastestRoute: {
    icon: FaClock,
    tagline: "Trims destinations that don't fit your days, then optimizes the fastest order.",
  },
  bestOverall: {
    icon: FaMapMarkedAlt,
    tagline: "A fresh, varied trip built from destinations across Sri Lanka, sized to fit your days comfortably.",
  },
};

const TourPreview = () => {
  const navigate = useNavigate();
  const { clearTrip } = useTrip();

  const [phase, setPhase] = useState("checking");
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [routeOptions, setRouteOptions] = useState(null);

  const [startDistrict, setStartDistrict] = useState(null);
  const [startCoords, setStartCoords] = useState(null);

  const [tripStartDate, setTripStartDate] = useState("");
  const [tripGuestCount, setTripGuestCount] = useState(null);

  const [tripDurationDays, setTripDurationDays] = useState(1);

  const [activeGuideModal, setActiveGuideModal] = useState(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [modalView, setModalView] = useState("list");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [checkingGuideAvailability, setCheckingGuideAvailability] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    date: "",
    durationType: "daily",
    quantity: 1,
    numberOfGuests: 1,
    message: "",
  });

  const [activeTransportModal, setActiveTransportModal] = useState(null);
  const [transportModalView, setTransportModalView] = useState("list");
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [transportBookingError, setTransportBookingError] = useState("");
  const [transportBookingForm, setTransportBookingForm] = useState({
    pickupDate: "",
    returnDate: "",
    numberOfGuests: 1,
    bags: 0,
  });
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState("");

  const [activeHotelModal, setActiveHotelModal] = useState(null);
  const [hotelModalView, setHotelModalView] = useState("list");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hotelBookingForm, setHotelBookingForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
  });
  const [hotelBookingError, setHotelBookingError] = useState("");
  const [hotelStayDates, setHotelStayDates] = useState({});

  const [bookedGuideIds, setBookedGuideIds] = useState(new Set());
  const [bookedTransportIds, setBookedTransportIds] = useState(new Set());
  const [bookedRoomIds, setBookedRoomIds] = useState(new Set());

  const [guideBudget, setGuideBudget] = useState(0);
  const [transportBudget, setTransportBudget] = useState(0);
  const [hotelBudget, setHotelBudget] = useState(0);

  const [cart, setCart] = useState({ guides: [], transports: [], hotels: [] });
  const [startingTour, setStartingTour] = useState(false);
  const [startTourError, setStartTourError] = useState("");
  const [startTourSuccess, setStartTourSuccess] = useState(false);

  const calculateReturnDate = (startDate, days) => {
    if (!startDate || !days) return "";

    const date = new Date(startDate);
    date.setDate(date.getDate() + Number(days));

    return date.toISOString().split("T")[0];
  };

  const buildRoute = async (destinationIds, district, tripDurationDaysOverride, startCoordsOverride) => {
    setPhase("building-route");
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tour/generate-trip`, {
        destinationIds,
        startDistrict: district,
        tripDurationDays: tripDurationDaysOverride,
        startLat: startCoordsOverride?.lat,
        startLng: startCoordsOverride?.lng,
      });
      setRouteOptions(res.data.options);
      setPhase("route-options");
    } catch (err) {
      console.error("generate-trip failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Could not generate your trip route. Please try again later");
      setPhase("error");
    }
  };

  useEffect(() => {
    const loadTrip = async () => {
      const saved = sessionStorage.getItem("TourBooking");
      if (!saved) {
        navigate("/tours/plan");
        return;
      }
      const {
        selectedDestinations,
        startDistrict: district,
        tripDurationDays: savedDuration,
      } = JSON.parse(saved);
      setStartDistrict(district);

      const savedStartDate = sessionStorage.getItem("tourStartDate");
      if (savedStartDate) setTripStartDate(savedStartDate);

      const savedGuestCount = sessionStorage.getItem("tourNumberOfGuests");
      if (savedGuestCount) setTripGuestCount(Number(savedGuestCount));

      const savedStartLat = sessionStorage.getItem("tourStartLat");
      const savedStartLng = sessionStorage.getItem("tourStartLng");
      const savedStartAddress = sessionStorage.getItem("tourStartAddress");
      let startCoordsForRoute = null;
      if (savedStartLat && savedStartLng) {
        startCoordsForRoute = {
          lat: Number(savedStartLat),
          lng: Number(savedStartLng),
          address: savedStartAddress || district,
        };
        setStartCoords(startCoordsForRoute);
      }

      if (!district) {
        setError("Select your starting district first");
        setPhase("error");
        navigate("/tours");
        return;
      }

      const initialDays = Number(savedDuration || sessionStorage.getItem("tourTripDuration") || 1);
      const destinationIds = selectedDestinations.map((d) => d._id);

      setTripDurationDays(initialDays);

      await buildRoute(destinationIds, district, initialDays, startCoordsForRoute);
    };

    loadTrip();
  }, [navigate]);

  const handleSelectRouteOption = (optionKey) => {
    if (!routeOptions || !routeOptions[optionKey]) return;
    setTripData(routeOptions[optionKey]);
    setPhase("ready");
  };

  if (phase === "checking") {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        Checking your trip against your selected days...
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex flex-col items-center justify-center text-center px-6">
        <p className="mb-4">{error || "Unable to load the data"}</p>
        <button onClick={() => navigate("/tours/plan")} className="text-[#00C896] text-sm underline">
          ← Change your destinations
        </button>
      </div>
    );
  }

  if (phase === "building-route") {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        Generating your trip route...
      </div>
    );
  }

  if (phase === "route-options") {
    if (!routeOptions) {
      return (
        <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
          Loading route options...
        </div>
      );
    }

    const optionKeys = ["shortestDistance", "fastestRoute", "bestOverall"];

    return (
      <div className="min-h-screen bg-[#11212D] text-white">
        <Navbar />
        <div className="px-6 py-10 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Choose Your Trip Style</h1>
          <p className="text-gray-400 mb-8">
            We've put together a few different ways to run this trip — pick the one that fits you best.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {optionKeys.map((key) => {
              const option = routeOptions[key];
              if (!option) return null;
              const meta = ROUTE_OPTION_META[key];
              const Icon = meta.icon;

              return (
                <div key={key} className="bg-[#253745] rounded-xl p-5 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="text-[#00C896]" size={18} />
                    <h3 className="text-[#00C896] font-semibold">{option.label}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{meta.tagline}</p>

                  {key === "shortestDistance" && option.itinerary && (
                    <div className="mb-4 bg-[#1a2530] rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated trip length</span>
                        <span className="font-semibold text-[#00C896]">
                          {option.estimatedDays || option.itinerary.length} day
                          {(option.estimatedDays || option.itinerary.length) > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2">
                        Calculated from typical visit times for all {option.destinations.length} selected destinations.
                      </p>
                    </div>
                  )}

                  {key === "fastestRoute" && option.excludedCount > 0 && (
                    <p className="text-[11px] text-yellow-400 mb-3">
                      {option.excludedCount} destination{option.excludedCount > 1 ? "s" : ""} trimmed to fit {tripDurationDays} day{tripDurationDays > 1 ? "s" : ""}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 mb-4 bg-[#1a2530] rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Destinations</span>
                      <span className="font-semibold">{option.destinations.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total distance</span>
                      <span className="font-semibold">{option.route.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Driving time</span>
                      <span className="font-semibold">{formatDuration(option.route.durationMin)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4 flex-1 min-h-0 overflow-y-auto">
                    {option.destinations.map((d, i) => (
                      <div key={d._id || i} className="text-xs text-gray-300 truncate flex-shrink-0 leading-5">
                        {i + 1}. {d.name}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectRouteOption(key)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] transition-colors"
                  >
                    <FaRoute size={12} /> Choose this trip
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={() => navigate("/tours/plan")} className="mt-8 text-gray-400 text-sm hover:text-white">
            ← Change your destinations instead
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">
        Loading your trip...
      </div>
    );
  }

  const { destinations, route, recommendations, itinerary } = tripData || {};
  const routableStops = route?.routableStops || [];
  const polylinePositions = route.geometry || [];
  const returnPolylinePositions = route.returnGeometry || [];

  const startCoord =
    (startCoords && startCoords.lat != null && startCoords.lng != null
      ? [startCoords.lat, startCoords.lng]
      : null) ||
    getCoordFromStop(routableStops[0]) ||
    (polylinePositions.length > 0 ? polylinePositions[0] : null);

  if (!startCoords && !getCoordFromStop(routableStops[0])) {
    console.warn(
      "TourPreview: no pinned start location found in sessionStorage (tourStartLat/tourStartLng) and no routableStops[0] from the API — falling back to the first point of route.geometry, which can land on the first destination instead of the real start point."
    );
  }
  const START_MATCH_THRESHOLD_KM = 0.5
  const geometryMatchesStart =
    startCoord &&
    polylinePositions.length > 0 &&
    haversineKm(
      startCoord[0],
      startCoord[1],
      polylinePositions[0][0],
      polylinePositions[0][1]
    ) <= START_MATCH_THRESHOLD_KM

    const safePolylinePossitions = 
      startCoord && !geometryMatchesStart
        ? [startCoord, ...polylinePositions]
        : polylinePositions
    const allMapPositions = [...safePolylinePossitions, ...returnPolylinePositions]

  const legDistances = destinations.map((dest, index) => {
    const prevCoord = index === 0
      ? startCoord
      : [destinations[index - 1].latitude, destinations[index - 1].longitude];
    if (!prevCoord || dest.latitude == null || dest.longitude == null) return null;
    return haversineKm(prevCoord[0], prevCoord[1], dest.latitude, dest.longitude);
  });

  const centerLat = allMapPositions.length > 0
    ? allMapPositions.reduce((sum, p) => sum + p[0], 0) / allMapPositions.length
    : 7.8731;
  const centerLng = allMapPositions.length > 0
    ? allMapPositions.reduce((sum, p) => sum + p[1], 0) / allMapPositions.length
    : 80.7718;

  const getRecommendationForLocation = (location) => {
    return recommendations.find(
      (rec) => rec.location?.toLowerCase().trim() === location?.toLowerCase().trim()
    );
  };

  const destinationDayInfo = new Map();
  (itinerary || []).forEach((day) => {
    day.destinations.forEach((d, idxInDay) => {
      destinationDayInfo.set(String(d._id), {
        dayNumber: day.dayNumber,
        timeSlot: d.timeSlot,
        isDayEnd: idxInDay === day.destinations.length - 1,
      });
    });
  });

  const getDayInfoForDestination = (dest, index) => {
    const info = destinationDayInfo.get(String(dest._id || dest.id));
    if (info) return info;
    return { dayNumber: index + 1, timeSlot: null, isDayEnd: true };
  };

  const getMinCheckInDate = (dayIndex) => {
    if (dayIndex === 0) return tripStartDate;
    return hotelStayDates[dayIndex - 1] || tripStartDate;
  };

  const closeModal = () => {
    setActiveGuideModal(null);
    setModalView("list");
    setSelectedGuide(null);
    setShowPhoneNumber(false);
    setBookingError("");
    setBookingForm({ date: "", durationType: "daily", quantity: 1, numberOfGuests: 1, message: "" });
  };

  const totalPrice = selectedGuide ? bookingForm.quantity * selectedGuide.pricePerDay : 0;

  const handleAddGuideToCart = async () => {
    setBookingError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setBookingError("Please login as a traveler to book a guide");
      return;
    }
    if (!bookingForm.date) {
      setBookingError("Please select a date");
      return;
    }
    if (bookingForm.numberOfGuests > selectedGuide.maximumGuests) {
      setBookingError("Exceeds guide's maximum capacity");
      return;
    }

    const requestedStart = new Date(bookingForm.date);
    const requestedEnd = new Date(requestedStart);
    requestedEnd.setDate(requestedEnd.getDate() + Number(bookingForm.quantity) - 1);

    const cartConflict = cart.guides.some((item) => {
      if (item.guideId !== selectedGuide._id) return false;
      const iStart = new Date(item.date);
      const iEnd = new Date(iStart);
      iEnd.setDate(iEnd.getDate() + Number(item.quantity) - 1);
      return requestedStart <= iEnd && iStart <= requestedEnd;
    });
    if (cartConflict) {
      setBookingError("You've already added this guide to your cart for an overlapping date");
      return;
    }

    setCheckingGuideAvailability(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/guidebooking/check-availability/${selectedGuide._id}`,
        {
          params: { date: bookingForm.date, quantity: bookingForm.quantity },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.data.available) {
        setBookingError(res.data.reason || "This guide already has a booking that overlaps your selected dates");
        setCheckingGuideAvailability(false);
        return;
      }
    } catch (err) {
      console.error(err);
      setBookingError("Could not verify availability, please try again");
      setCheckingGuideAvailability(false);
      return;
    }
    setCheckingGuideAvailability(false);

    const cartItem = {
      cartId: `guide-${selectedGuide._id}-${Date.now()}`,
      guideId: selectedGuide._id,
      date: bookingForm.date,
      durationType: bookingForm.durationType,
      quantity: bookingForm.quantity,
      numberOfGuests: bookingForm.numberOfGuests,
      message: bookingForm.message,
      totalPrice,
      currency: selectedGuide.currency,
      displayName: `${selectedGuide.firstName} ${selectedGuide.lastName}`,
    };

    setCart((prev) => ({ ...prev, guides: [...prev.guides, cartItem] }));
    setBookedGuideIds((prev) => new Set(prev).add(selectedGuide._id));
    setGuideBudget((prev) => prev + totalPrice);
    closeModal();
  };

  const removeGuideFromCart = (cartId) => {
    setCart((prev) => {
      const item = prev.guides.find((g) => g.cartId === cartId);
      if (!item) return prev;
      setGuideBudget((b) => b - item.totalPrice);
      const stillInCart = prev.guides.some((g) => g.cartId !== cartId && g.guideId === item.guideId);
      if (!stillInCart) {
        setBookedGuideIds((prevIds) => {
          const next = new Set(prevIds);
          next.delete(item.guideId);
          return next;
        });
      }
      return { ...prev, guides: prev.guides.filter((g) => g.cartId !== cartId) };
    });
  };

  const tripDays = destinations.length;
  const closeTransportModal = () => {
    setActiveTransportModal(null);
    setTransportModalView("list");
    setSelectedTransport(null);
    setTransportBookingError("");
    setTransportBookingForm({
      pickupDate: tripStartDate || "",
      returnDate: calculateReturnDate(tripStartDate, tripDays),
      numberOfGuests: tripGuestCount || 1,
      bags: 0,
    });
    setEstimatedDistance(null);
    setEstimatedPrice(null);
    setEstimateError("");
  };

  const fetchTransportEstimate = async (vehicleId) => {
    setEstimateLoading(true);
    setEstimateError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/transport/booking-estimate`, {
        vehicleId,
        distanceKm: route.distanceKm,
        isReturnTrip: true,
      });
      setEstimatedDistance(res.data.distanceKm);
      setEstimatedPrice(res.data.totalPrice);
    } catch (err) {
      console.error(err);
      setEstimateError("Could not calculate distance/price for this route");
      setEstimatedDistance(null);
      setEstimatedPrice(null);
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleAddTransportToCart = async () => {
    setTransportBookingError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUserRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    const travelerId = storedUser?._id;

    if (!token || !travelerId) {
      setTransportBookingError("Please login as a traveler to book a vehicle");
      return;
    }
    if (!transportBookingForm.pickupDate || !transportBookingForm.returnDate) {
      setTransportBookingError("Please select pickup and return dates");
      return;
    }
    if (transportBookingForm.numberOfGuests > selectedTransport.passengerCapacity) {
      setTransportBookingError("Exceeds vehicle's passenger capacity");
      return;
    }

    const requestedStart = new Date(transportBookingForm.pickupDate);
    const requestedEnd = new Date(transportBookingForm.returnDate);

    const cartConflict = cart.transports.some((item) => {
      if (item.vehicleId !== selectedTransport._id) return false;
      const iStart = new Date(item.pickupDate);
      const iEnd = new Date(item.returnDate);
      return requestedStart <= iEnd && iStart <= requestedEnd;
    });
    if (cartConflict) {
      setTransportBookingError("You've already added this vehicle to your cart for overlapping dates");
      return;
    }

    setEstimateLoading(true);
    try {
      const availRes = await axios.get(
        `${API_BASE_URL}/api/transport/check-availability/${selectedTransport._id}`,
        { params: { pickupDate: transportBookingForm.pickupDate, returnDate: transportBookingForm.returnDate, isReturnTrip: true } }
      );
      if (!availRes.data.available) {
        setTransportBookingError("This vehicle is already booked for the selected dates");
        setEstimateLoading(false);
        return;
      }
    } catch (err) {
      console.error(err);
      setTransportBookingError("Could not verify availability, please try again");
      setEstimateLoading(false);
      return;
    }
    setEstimateLoading(false);

    const cartItem = {
      cartId: `transport-${selectedTransport._id}-${Date.now()}`,
      vehicleId: selectedTransport._id,
      pickupLocation: startDistrict,
      dropoffLocation: activeTransportModal.location,
      pickup: startCoords
        ? { lat: startCoords.lat, lng: startCoords.lng }
        : { lat: destinations[0].latitude, lng: destinations[0].longitude },
      destination: {
        lat: destinations[destinations.length - 1].latitude,
        lng: destinations[destinations.length - 1].longitude,
      },
      pickupDate: transportBookingForm.pickupDate,
      returnDate: transportBookingForm.returnDate,
      numberOfGuests: transportBookingForm.numberOfGuests,
      bags: transportBookingForm.bags,
      totalPrice: estimatedPrice || 0,
      displayName: `${selectedTransport.vehicleBrand} ${selectedTransport.vehicleModel}`,
    };

    setCart((prev) => ({ ...prev, transports: [...prev.transports, cartItem] }));
    setBookedTransportIds((prev) => new Set(prev).add(selectedTransport._id));
    setTransportBudget((prev) => prev + (estimatedPrice || 0));
    closeTransportModal();
  };

  const removeTransportFromCart = (cartId) => {
    setCart((prev) => {
      const item = prev.transports.find((t) => t.cartId === cartId);
      if (!item) return prev;
      setTransportBudget((b) => b - item.totalPrice);
      const stillInCart = prev.transports.some((t) => t.cartId !== cartId && t.vehicleId === item.vehicleId);
      if (!stillInCart) {
        setBookedTransportIds((prevIds) => {
          const next = new Set(prevIds);
          next.delete(item.vehicleId);
          return next;
        });
      }
      return { ...prev, transports: prev.transports.filter((t) => t.cartId !== cartId) };
    });
  };

  const closeHotelModal = () => {
    setActiveHotelModal(null);
    setHotelModalView("list");
    setSelectedHotel(null);
    setHotelRooms([]);
    setRoomsError("");
    setSelectedRoom(null);
    setHotelBookingError("");
    setHotelBookingForm({
      checkInDate: "",
      checkOutDate: "",
      numberOfGuests: tripGuestCount || 1,
    });
  };

  const fetchRoomsForHotel = async (hotelId) => {
    setRoomsLoading(true);
    setRoomsError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/addRoom/hotel/${hotelId}`);
      setHotelRooms(res.data);
    } catch (err) {
      console.error(err);
      setRoomsError("Could not load rooms for this hotel");
      setHotelRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const hotelNights = (() => {
    if (!hotelBookingForm.checkInDate || !hotelBookingForm.checkOutDate) return 0;
    const checkIn = new Date(hotelBookingForm.checkInDate);
    const checkOut = new Date(hotelBookingForm.checkOutDate);
    const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const hotelTotalPrice = selectedRoom ? hotelNights * selectedRoom.pricePerNight : 0;

  const handleAddHotelToCart = async () => {
    setHotelBookingError("");
    const storedUserRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    const travelerId = storedUser?._id;

    if (!travelerId) {
      setHotelBookingError("Please login as a traveler to book a room");
      return;
    }
    if (hotelNights <= 0) {
      setHotelBookingError("Check-out date must be after check-in date");
      return;
    }
    if (hotelBookingForm.numberOfGuests > selectedRoom.capacity) {
      setHotelBookingError("Exceeds room's guest capacity");
      return;
    }

    const dayIndex = activeHotelModal?.dayIndex ?? 0;
    const minCheckIn = getMinCheckInDate(dayIndex);
    if (minCheckIn && hotelBookingForm.checkInDate < minCheckIn) {
      setHotelBookingError(
        dayIndex === 0
          ? "Check-in can't be before your trip start date"
          : "Check-in can't be before you check out of your previous hotel"
      );
      return;
    }

    const requestedStart = new Date(hotelBookingForm.checkInDate);
    const requestedEnd = new Date(hotelBookingForm.checkOutDate);

    const cartConflict = cart.hotels.some((item) => {
      if (item.roomId !== selectedRoom._id) return false;
      const iStart = new Date(item.checkInDate);
      const iEnd = new Date(item.checkOutDate);
      return requestedStart < iEnd && iStart < requestedEnd;
    });
    if (cartConflict) {
      setHotelBookingError("You've already added this room to your cart for overlapping dates");
      return;
    }

    setRoomsLoading(true);
    try {
      const availRes = await axios.get(
        `${API_BASE_URL}/api/booking/check-availability/${selectedRoom._id}`,
        { params: { checkInDate: hotelBookingForm.checkInDate, checkOutDate: hotelBookingForm.checkOutDate } }
      );
      if (!availRes.data.available) {
        setHotelBookingError("This room is already booked for the selected dates");
        setRoomsLoading(false);
        return;
      }
    } catch (err) {
      console.error(err);
      setHotelBookingError("Could not verify availability, please try again");
      setRoomsLoading(false);
      return;
    }
    setRoomsLoading(false);

    const cartItem = {
      cartId: `hotel-${selectedRoom._id}-${Date.now()}`,
      hotelId: selectedHotel._id,
      roomId: selectedRoom._id,
      checkInDate: hotelBookingForm.checkInDate,
      checkOutDate: hotelBookingForm.checkOutDate,
      numberOfGuests: hotelBookingForm.numberOfGuests,
      totalPrice: hotelTotalPrice,
      dayIndex,
      displayName: `${selectedHotel.hotelName} — ${selectedRoom.roomType}`,
    };

    setCart((prev) => ({ ...prev, hotels: [...prev.hotels, cartItem] }));
    setHotelStayDates((prev) => ({ ...prev, [dayIndex]: hotelBookingForm.checkOutDate }));
    setBookedRoomIds((prev) => new Set(prev).add(selectedRoom._id));
    setHotelBudget((prev) => prev + hotelTotalPrice);
    closeHotelModal();
  };

  const removeHotelFromCart = (cartId) => {
    setCart((prev) => {
      const item = prev.hotels.find((h) => h.cartId === cartId);
      if (!item) return prev;
      setHotelBudget((b) => b - item.totalPrice);
      setBookedRoomIds((prevIds) => {
        const next = new Set(prevIds);
        next.delete(item.roomId);
        return next;
      });
      setHotelStayDates((prevDates) => {
        const next = { ...prevDates };
        if (next[item.dayIndex] === item.checkOutDate) delete next[item.dayIndex];
        return next;
      });
      return { ...prev, hotels: prev.hotels.filter((h) => h.cartId !== cartId) };
    });
  };

  const totalCartItems = cart.guides.length + cart.transports.length + cart.hotels.length;

  const handleStartTour = async () => {
    setStartTourError("");
    setStartTourSuccess(false);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUserRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    const travelerId = storedUser?._id;

    if (!token || !travelerId) {
      setStartTourError("Please login as a traveler to start your tour");
      return;
    }

    setStartingTour(true);

    let tourId = null;
    try {
      const tourRes = await axios.post(
        `${API_BASE_URL}/api/tour`,
        {
          destinations: destinations.map((d, i) => {
            const dayInfo = getDayInfoForDestination(d, i);
            return {
              id: d.id || `stop-${i}`,
              name: d.name || d.district || `Stop ${i + 1}`,
              location: d.location,
              latitude: d.latitude,
              longitude: d.longitude,
              order: i,
              dayNumber: dayInfo.dayNumber,
              timeSlot: dayInfo.timeSlot
            };
          }),
          routeGeometry: JSON.stringify(route),
          totalDistanceKm: route.distanceKm,
          tripStartDate,
          tripDurationDays,
          estimatedBudget: guideBudget + transportBudget + hotelBudget,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tourId = tourRes.data._id;
      clearTrip();
    } catch (err) {
      console.error("Failed to create tour:", err.response?.data);
      setStartTourError("Failed to start your tour, please try again");
      setStartingTour(false);
      return;
    }

    const failedNames = [];
    const remainingGuides = [];
    const remainingTransports = [];
    const remainingHotels = [];
    const successfulGuides = [];
    const successfulTransports = [];
    const successfulHotels = [];

    for (const item of cart.guides) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/guidebooking`,
          {
            guideId: item.guideId,
            date: item.date,
            durationType: item.durationType,
            quantity: item.quantity,
            numberOfGuests: item.numberOfGuests,
            message: item.message,
            totalPrice: item.totalPrice,
            tourId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successfulGuides.push(item);
      } catch (err) {
        console.error("Guide booking failed:", err.response?.data);
        const reason = err.response?.data?.message || "unknown error";
        failedNames.push(`Guide: ${item.displayName} (${reason})`);
        remainingGuides.push(item);
      }
    }

    for (const item of cart.transports) {
      try {
        await axios.post(
            `${API_BASE_URL}/api/transport/bookings`,
            {
              vehicleId: item.vehicleId,
              travelerId,
              pickupLocation: item.pickupLocation,
              dropoffLocation: item.dropoffLocation,
              pickupLat: item.pickup.lat,
              pickupLng: item.pickup.lng,
              dropoffLat: item.destination.lat,
              dropoffLng: item.destination.lng,
              pickupDate: item.pickupDate,
              returnDate: item.returnDate,
              numberOfPassengers: item.numberOfGuests,
              bags: item.bags,
              isReturnTrip: true,
              tourId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        successfulTransports.push(item);
      } catch (err) {
        console.error("Transport booking failed:", err.response?.data);
        const reason = err.response?.data?.message || "unknown error";
        failedNames.push(`Vehicle: ${item.displayName} (${reason})`);
        remainingTransports.push(item);
      }
    }

    for (const item of cart.hotels) {
      try {
        await axios.post(`${API_BASE_URL}/api/booking/create`, {
          hotelId: item.hotelId,
          roomId: item.roomId,
          travelerId,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          numberOfGuests: item.numberOfGuests,
          tourId,
        });
        successfulHotels.push(item);
      } catch (err) {
        console.error("Hotel booking failed:", err.response?.data);
        const reason = err.response?.data?.message || "unknown error";
        failedNames.push(`Hotel: ${item.displayName} (${reason})`);
        remainingHotels.push(item);
      }
    }

    const finalGuideBudget = successfulGuides.reduce((sum, g) => sum + g.totalPrice, 0);
    const finalHotelBudget = successfulHotels.reduce((sum, h) => sum + h.totalPrice, 0);
    const finalTransportBudget = successfulTransports.reduce((sum, t) => sum + t.totalPrice, 0);

    if (successfulGuides.length > 0 || successfulTransports.length > 0 || successfulHotels.length > 0) {
      try {
        await axios.post(`${API_BASE_URL}/api/tour/send-summary`, {
          travelerId,
          destinations,
          guideBookings: successfulGuides,
          hotelBookings: successfulHotels,
          transportBookings: successfulTransports,
          guideBudget: finalGuideBudget,
          hotelBudget: finalHotelBudget,
          transportBudget: finalTransportBudget,
          estimatedBudget: finalGuideBudget + finalHotelBudget + finalTransportBudget,
        });
      } catch (err) {
        console.error("Trip summary email failed:", err.response?.data);
      }
    }

    if (tourId && (successfulGuides.length > 0 || successfulTransports.length > 0 || successfulHotels.length > 0)) {
      try {
        await axios.put(
          `${API_BASE_URL}/api/tour/${tourId}/confirm`,
          {
            selectedGuide: successfulGuides[0]?.guideId,
            selectedHotels: successfulHotels.map((h) => h.hotelId),
            selectedTransport: successfulTransports[0]?.vehicleId,
            estimatedBudget: finalGuideBudget + finalHotelBudget + finalTransportBudget,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to confirm tour:", err.response?.data);
      }
    }

    setStartingTour(false);
    setCart({ guides: remainingGuides, transports: remainingTransports, hotels: remainingHotels });
    setGuideBudget(remainingGuides.reduce((sum, g) => sum + g.totalPrice, 0));
    setTransportBudget(remainingTransports.reduce((sum, t) => sum + t.totalPrice, 0));
    setHotelBudget(remainingHotels.reduce((sum, h) => sum + h.totalPrice, 0));

    if (failedNames.length === 0) {
      const tripSummary = {
        destinations,
        guideBookings: successfulGuides,
        hotelBookings: successfulHotels,
        transportBookings: successfulTransports,
        guideBudget: finalGuideBudget,
        hotelBudget: finalHotelBudget,
        transportBudget: finalTransportBudget,
        totalBudget: finalGuideBudget + finalHotelBudget + finalTransportBudget,
        savedAt: Date.now(),
      };
      localStorage.setItem("activeTourSummary", JSON.stringify(tripSummary));
      navigate("/tours");
    } else {
      setStartTourError(`These couldn't be sent, please try again: ${failedNames.join(", ")}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#11212D] text-white">
      <Navbar />
      <div className="px-6 py-10">
        <div className="tour-preview-title-anim">
          <h1 className="text-2xl font-bold mb-2">Your Trip Route</h1>
          <p className="text-gray-400 mb-2">
            Total distance (round trip):{" "}
            <span className="text-[#00C896] font-semibold">{route.distanceKm} km</span>
            {typeof route.durationMin === "number" && (
              <>
                {" "}· Driving time:{" "}
                <span className="text-[#00C896] font-semibold">{formatDuration(route.durationMin)}</span>
              </>
            )}
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
        </div>

        <div className="tour-preview-map-anim relative z-0 rounded-xl overflow-hidden mb-8" style={{ height: "450px" }}>
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
            {startCoord && (
              <Marker position={startCoord} icon={createStartIcon()}>
                <Popup>
                  <strong>Start — {startCoords?.address || startDistrict}</strong>
                </Popup>
              </Marker>
            )}
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
              positions={safePolylinePossitions}
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

        <div className="tour-preview-order-anim mb-8">
          <h2 className="text-xl font-semibold mb-1">Trip Order</h2>
          <p className="text-xs text-gray-400 mb-3">
            Tap Guides, Hotels or Transport on any stop to add a booking to your cart.
          </p>
          <div className="flex flex-col gap-3">
            {(() => {
              const startRec = getRecommendationForLocation(startDistrict);
              const startGuides = startRec?.guides || [];
              const startHotels = startRec?.hotels || [];
              const startTransports = startRec?.transports || [];
              return (
                <div className="bg-[#253745] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        Start
                      </span>
                      {startCoords?.address || startDistrict}
                    </span>
                    <span className="text-sm text-gray-400">
                      Total : {route.distanceKm} km
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                      className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                      onClick={() =>
                        startRec && setActiveGuideModal({ location: startRec.location, guides: startGuides })
                      }
                    >
                      <p className="text-[11px] text-gray-500 mb-2">
                        You can book a guide if you wish. Your guide will accompany you throughout your entire trip.
                      </p>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <FaUserTie className="text-[#00C896] text-[12px] flex-shrink-0" />
                        Guides ({startGuides.length})
                        {startGuides.some((g) => bookedGuideIds.has(g._id)) && (
                          <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                        )}
                      </p>
                      {startGuides.slice(0, 2).map((g) => (
                        <p key={g._id} className="text-xs text-gray-400 truncate">{g.firstName} {g.lastName}</p>
                      ))}
                      {startGuides.length > 2 && (
                        <p className="text-xs text-[#00C896] mt-1">+{startGuides.length - 2} more · click to view</p>
                      )}
                    </div>
                    <div
                      className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                      onClick={() =>
                        startRec &&
                        setActiveHotelModal({ location: startRec.location, hotels: startHotels, dayIndex: 0 })
                      }
                    >
                      <p className="text-[11px] text-gray-500 mb-2">
                        If you need accommodation at your destination, you can book a hotel that suits your needs.
                      </p>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <FaHotel className="text-[#00C896] text-[12px] flex-shrink-0" />
                        Hotels ({startHotels.length})
                        {hotelStayDates[0] && (
                          <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                        )}
                      </p>
                      {startHotels.slice(0, 2).map((h) => (
                        <p key={h._id} className="text-xs text-gray-400 truncate">{h.hotelName}</p>
                      ))}
                      {startHotels.length > 2 && (
                        <p className="text-xs text-[#00C896] mt-1">+{startHotels.length - 2} more · click to view</p>
                      )}
                    </div>
                    <div
                      className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                      onClick={() =>
                        startRec &&
                        setActiveTransportModal({ location: startRec.location, transports: startTransports })
                      }
                    >
                      <p className="text-[11px] text-gray-500 mb-2">
                        You can book a vehicle if you wish. Your driver will be available throughout your entire trip.
                      </p>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <FaCar className="text-[#00C896] text-[12px] flex-shrink-0" />
                        Transport ({startTransports.length})
                        {startTransports.some((t) => bookedTransportIds.has(t._id)) && (
                          <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                        )}
                      </p>
                      {startTransports.slice(0, 2).map((t) => (
                        <p key={t._id} className="text-xs text-gray-400 truncate">{t.vehicleBrand} {t.vehicleModel}</p>
                      ))}
                      {startTransports.length > 2 && (
                        <p className="text-xs text-[#00C896] mt-1">+{startTransports.length - 2} more · click to view</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {destinations.map((dest, index) => {
              const dayInfo = getDayInfoForDestination(dest, index);
              const dayIndex = dayInfo.dayNumber;
              const prevDayInfo = index > 0 ? getDayInfoForDestination(destinations[index - 1], index - 1) : null;
              const isNewDay = index === 0 || prevDayInfo?.dayNumber !== dayInfo.dayNumber;
              const destRec = getRecommendationForLocation(dest.location);
              const destHotels = destRec?.hotels || [];
              const legDistance = legDistances[index];
              return (
                <React.Fragment key={dest.id || `stop-${index}`}>
                  {isNewDay && (
                    <div className="flex items-center gap-3 mt-5 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#11212D] bg-[#00C896] px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                        Day {String(dayIndex).padStart(2, "0")}
                      </span>
                      <div className="flex-1 h-px bg-[#00C896]/30" />
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-4 border-l-2 border-dashed border-[#00C896]/40" />
                    <span className="text-[10px] text-[#00C896] font-medium bg-[#11212D] px-2 py-0.5 rounded-full border border-[#00C896]/30 my-0.5 whitespace-nowrap">
                      {legDistance != null ? `${legDistance.toFixed(1)} km` : "—"}
                    </span>
                    <div className="w-px h-4 border-l-2 border-dashed border-[#00C896]/40" />
                  </div>
                  <div className="bg-[#253745] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div>
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#00C896]/10 text-[#00C896] text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        {dest.name}
                      </span>
                      {dayInfo.timeSlot && (
                        <p className="text-[11px] text-gray-500 mt-1 ml-8">{dayInfo.timeSlot}</p>
                      )}
                    </div>

                    {dayInfo.isDayEnd ? (
                      <div
                        className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                        onClick={() =>
                          destRec &&
                          setActiveHotelModal({ location: destRec.location, hotels: destHotels, dayIndex })
                        }
                      >
                        <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                          <FaHotel className="text-[#00C896] text-[12px] flex-shrink-0" />
                          Hotels ({destHotels.length})
                          {hotelStayDates[dayIndex] && (
                            <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                          )}
                        </p>
                        {destHotels.slice(0, 2).map((h) => (
                          <p key={h._id} className="text-xs text-gray-400 truncate">{h.hotelName}</p>
                        ))}
                        {destHotels.length > 2 && (
                          <p className="text-xs text-[#00C896] mt-1">+{destHotels.length - 2} more · click to view</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic md:text-right">
                        Same-day stop — continuing to the next destination
                      </p>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {totalCartItems > 0 && (
          <div className="tour-preview-cart-anim mt-10 bg-[#253745] rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <FaShoppingCart className="text-[#00C896]" /> Your Cart
            </h3>
            <div className="flex flex-col gap-2">
              {cart.guides.map((item) => (
                <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded-lg px-3 py-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">Guide — {item.displayName}</p>
                    <p className="text-xs text-gray-400">{item.date} · {item.quantity} day(s) · {item.numberOfGuests} guest(s)</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-[#00C896] font-semibold">{item.currency} {item.totalPrice.toLocaleString()}</span>
                    <button onClick={() => removeGuideFromCart(item.cartId)} className="text-gray-400 hover:text-red-400" title="Remove">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.transports.map((item) => (
                <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded-lg px-3 py-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">Vehicle — {item.displayName}</p>
                    <p className="text-xs text-gray-400">{item.pickupDate} → {item.returnDate} · {item.numberOfGuests} pax</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-[#00C896] font-semibold">LKR {item.totalPrice.toLocaleString()}</span>
                    <button onClick={() => removeTransportFromCart(item.cartId)} className="text-gray-400 hover:text-red-400" title="Remove">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.hotels.map((item) => (
                <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded-lg px-3 py-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">Hotel — {item.displayName}</p>
                    <p className="text-xs text-gray-400">{item.checkInDate} → {item.checkOutDate} · {item.numberOfGuests} guest(s)</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-[#00C896] font-semibold">LKR {item.totalPrice.toLocaleString()}</span>
                    <button onClick={() => removeHotelFromCart(item.cartId)} className="text-gray-400 hover:text-red-400" title="Remove">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tour-preview-budget-anim mt-6 bg-[#253745] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Estimated Trip Budget</h3>
            <p className="text-xs text-gray-400 mt-1">Based on items in your cart</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-[#00C896]">
              LKR {(guideBudget + transportBudget + hotelBudget).toLocaleString()}
            </span>
            <div className="text-xs text-gray-400 mt-1 flex gap-3 flex-wrap justify-end">
              <span>Guides: LKR {guideBudget.toLocaleString()}</span>
              <span>Hotels: LKR {hotelBudget.toLocaleString()}</span>
              <span>Transport: LKR {transportBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="tour-preview-cta-anim">
          {startTourError && (
            <p className="text-sm text-red-400 mt-3">{startTourError}</p>
          )}
          {startTourSuccess && (
            <p className="text-sm text-[#00C896] mt-3">
              Tour started! Booking requests were sent to all guides, hotels and vehicle owners in your cart.
            </p>
          )}

          <button
            onClick={handleStartTour}
            disabled={startingTour}
            className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold px-8 py-3 rounded-full hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlay size={12} />
            {startingTour ? "Starting Tour..." : totalCartItems === 0 ? "Start Tour (no bookings)" : "Start Tour"}
          </button>

          {totalCartItems === 0 && !startingTour && (
            <p className="text-xs text-gray-500 mt-2">
              No guide, hotel or vehicle added yet — that's fine, you can start the tour and add these anytime later.
            </p>
          )}
        </div>

        {activeGuideModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 px-4" onClick={closeModal}>
            <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#00C896]">
                  {modalView === "list" ? `Guides — ${activeGuideModal.location}` : "Add a Guide to Cart"}
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
                          <h4 className="text-white font-semibold text-sm flex items-center gap-1 min-w-0">
                            <span className="truncate min-w-0 flex-1">{g.firstName} {g.lastName}</span>
                            {bookedGuideIds.has(g._id) && (
                              <FaCheckCircle className="text-[#00C896] text-[12px] flex-shrink-0" title="Added to cart" />
                            )}
                          </h4>
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
                        onClick={handleAddGuideToCart}
                        disabled={checkingGuideAvailability || !bookingForm.date || bookingForm.numberOfGuests > selectedGuide.maximumGuests}
                        className="w-full bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {checkingGuideAvailability ? "Checking availability..." : "Add to Bookings"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTransportModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 px-4" onClick={closeTransportModal}>
            <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#00C896]">
                  {transportModalView === "list" ? `Vehicles — ${activeTransportModal.location}` : "Add a Vehicle to Cart"}
                </h3>
                <button onClick={closeTransportModal} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
              </div>

              {transportModalView === "list" && (
                <div className="flex flex-col gap-3">
                  {activeTransportModal.transports.map((t) => (
                    <div key={t._id} className="bg-[#1a2530] rounded-[14px] p-3 flex items-center gap-3">
                      <img
                        src={t.addVehiclePhotos?.[0] || "/vehicle_placeholder.jpg"}
                        alt={`${t.vehicleBrand} ${t.vehicleModel}`}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm flex items-center gap-1 min-w-0">
                          <span className="truncate min-w-0 flex-1">{t.vehicleBrand} {t.vehicleModel}</span>
                          {bookedTransportIds.has(t._id) && (
                            <FaCheckCircle className="text-[#00C896] text-[12px] flex-shrink-0" title="Added to cart" />
                          )}
                        </h4>
                        <p className="text-gray-400 text-[11px] mt-[2px]">{t.vehicleType} · {t.passengerCapacity} pax</p>
                        <p className="text-[#00C896] font-bold text-[13px] mt-[4px]">LKR {t.ratePerKm}/km</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTransport(t);
                          setTransportBookingForm({
                            pickupDate: tripStartDate || "",
                            returnDate: calculateReturnDate(tripStartDate, tripDays),
                            numberOfGuests: tripGuestCount || 1,
                            bags: 0,
                          });
                          setTransportModalView("book");
                          fetchTransportEstimate(t._id);
                        }}
                        className="border border-[#00C896] text-[#00C896] px-[14px] py-[7px] rounded-full text-[12px] hover:bg-[#00C896] hover:text-white transition-all duration-300 flex-shrink-0"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {transportModalView === "book" && selectedTransport && (
                <div>
                  <button onClick={() => setTransportModalView("list")} className="text-xs text-gray-400 mb-3">
                    ← Back to vehicles
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <img src={selectedTransport.addVehiclePhotos?.[0]} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{selectedTransport.vehicleBrand} {selectedTransport.vehicleModel}</p>
                      <p className="text-xs text-gray-400">{selectedTransport.registrationNo}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Pickup Date</label>
                      <input
                        type="date"
                        value={transportBookingForm.pickupDate}
                        readOnly={!!tripStartDate}
                        onChange={(e) => {
                          if (!tripStartDate) setTransportBookingForm({ ...transportBookingForm, pickupDate: e.target.value });
                        }}
                        style={{ colorScheme: "dark" }}
                        className={`w-full rounded-md px-3 py-2 text-sm outline-none text-white ${
                          tripStartDate ? "bg-[#1a2530] border border-white/5 cursor-not-allowed" : "bg-[#253745]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Return Date</label>
                      <input
                        type="date"
                        value={transportBookingForm.returnDate}
                        readOnly
                        className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Vehicle returns you to {startCoords?.address || startDistrict} — price includes the full round trip.</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Passengers (max {selectedTransport.passengerCapacity})</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedTransport.passengerCapacity}
                        value={transportBookingForm.numberOfGuests}
                        readOnly={!!tripGuestCount}
                        onChange={(e) => {
                          if (!tripGuestCount) setTransportBookingForm({ ...transportBookingForm, numberOfGuests: Number(e.target.value) });
                        }}
                        className={`w-full rounded-md px-3 py-2 text-sm outline-none text-white ${
                          tripGuestCount ? "bg-[#1a2530] border border-white/5 cursor-not-allowed" : "bg-[#253745]"
                        }`}
                      />
                      {transportBookingForm.numberOfGuests > selectedTransport.passengerCapacity && (
                        <p className="text-xs text-red-400 mt-1">Exceeds vehicle's passenger capacity.</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Bags (max {selectedTransport.luggageCapacity})</label>
                      <input
                        type="number"
                        min="0"
                        max={selectedTransport.luggageCapacity}
                        value={transportBookingForm.bags}
                        onChange={(e) => setTransportBookingForm({ ...transportBookingForm, bags: Number(e.target.value) })}
                        className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none text-white"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm text-gray-400">
                        Est. distance {estimateLoading ? "..." : estimatedDistance ? `(${estimatedDistance} km)` : ""}
                      </span>
                      <span className="text-lg font-semibold text-[#00C896]">
                        {estimateLoading ? "Calculating..." : estimatedPrice != null ? `LKR ${estimatedPrice.toLocaleString()}` : "—"}
                      </span>
                    </div>
                    {estimateError && <p className="text-xs text-red-400 -mt-1">{estimateError}</p>}
                    {transportBookingError && <p className="text-xs text-red-400 -mt-1">{transportBookingError}</p>}

                    <button
                      onClick={handleAddTransportToCart}
                      disabled={
                        estimateLoading ||
                        !transportBookingForm.pickupDate ||
                        !transportBookingForm.returnDate ||
                        transportBookingForm.numberOfGuests > selectedTransport.passengerCapacity
                      }
                      className="w-full bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {estimateLoading ? "Checking..." : "Add to Bookings"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeHotelModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 px-4" onClick={closeHotelModal}>
            <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#00C896]">
                  {hotelModalView === "list"
                    ? `Hotels — ${activeHotelModal.location}`
                    : hotelModalView === "rooms"
                    ? `Rooms — ${selectedHotel?.hotelName}`
                    : "Add a Room to Cart"}
                </h3>
                <button onClick={closeHotelModal} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
              </div>

              {hotelModalView === "list" && (
                <div className="flex flex-col gap-3">
                    {activeHotelModal.hotels.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No hotels available in this location.</p>
                    ) : (
                    activeHotelModal.hotels.map((h) => (
                        <div key={h._id} className="bg-[#1a2530] rounded-[14px] p-3 flex items-center gap-3">
                        <img
                            src={h.images?.[0] || "/hotel_placeholder.jpg"}
                            alt={h.hotelName}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">{h.hotelName}</h4>
                            <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-[4px]">
                            <FaMapMarkerAlt className="text-[#00C896] text-[12px]" />
                            <span className="truncate">{h.location}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                            setSelectedHotel(h);
                            setHotelModalView("rooms");
                            fetchRoomsForHotel(h._id);
                            }}
                            className="border border-[#00C896] text-[#00C896] px-[14px] py-[7px] rounded-full text-[12px] hover:bg-[#00C896] hover:text-white transition-all duration-300 flex-shrink-0"
                        >
                            View Rooms
                        </button>
                        </div>
                    ))
                    )}
                </div>
                )}
              {hotelModalView === "rooms" && selectedHotel && (
                <div>
                  <button
                    onClick={() => { setHotelModalView("list"); setSelectedHotel(null); setHotelRooms([]); }}
                    className="text-xs text-gray-400 mb-3"
                  >
                    ← Back to hotels
                  </button>

                  {roomsLoading ? (
                    <p className="text-gray-400 text-sm">Loading rooms...</p>
                  ) : roomsError ? (
                    <p className="text-red-400 text-sm">{roomsError}</p>
                  ) : hotelRooms.length === 0 ? (
                    <p className="text-gray-400 text-sm">No rooms available for this hotel.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {hotelRooms.map((r) => (
                        <div key={r._id} className="bg-[#1a2530] rounded-[14px] p-3 flex items-center gap-3">
                          <img
                            src={r.image || "/room_placeholder.jpg"}
                            src={r.images?.[0] || "room_placeholder.jpg"}
                            alt={r.roomType}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-1 min-w-0">
                              <span className="truncate min-w-0 flex-1">{r.roomType} · Room {r.roomNumber}</span>
                              {bookedRoomIds.has(r._id) && (
                                <FaCheckCircle className="text-[#00C896] text-[12px] flex-shrink-0" title="Added to cart" />
                              )}
                            </h4>
                            <p className="text-gray-400 text-[11px] mt-[2px]">Up to {r.capacity} guests</p>
                            <p className="text-[#00C896] font-bold text-[13px] mt-[4px]">LKR {r.pricePerNight}/night</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedRoom(r);
                              const dayIndex = activeHotelModal?.dayIndex ?? 0;
                              const minCheckIn = getMinCheckInDate(dayIndex);
                              setHotelBookingForm({
                                checkInDate: minCheckIn,
                                checkOutDate: calculateReturnDate(minCheckIn, 1),
                                numberOfGuests: tripGuestCount || 1,
                              });
                              setHotelModalView("book");
                            }}
                            className="border border-[#00C896] text-[#00C896] px-[14px] py-[7px] rounded-full text-[12px] hover:bg-[#00C896] hover:text-white transition-all duration-300 flex-shrink-0"
                          >
                            Book
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hotelModalView === "book" && selectedRoom && (
                <div>
                  <button onClick={() => setHotelModalView("rooms")} className="text-xs text-gray-400 mb-3">
                    ← Back to rooms
                  </button>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={hotelBookingForm.checkInDate}
                        min={getMinCheckInDate(activeHotelModal?.dayIndex ?? 0) || undefined}
                        onChange={(e) => setHotelBookingForm({ ...hotelBookingForm, checkInDate: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(activeHotelModal?.dayIndex ?? 0) === 0
                          ? "Can't check in before your trip start date."
                          : "Can't check in before you check out of your previous hotel."}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={hotelBookingForm.checkOutDate}
                        min={hotelBookingForm.checkInDate || undefined}
                        onChange={(e) => setHotelBookingForm({ ...hotelBookingForm, checkOutDate: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Guests (max {selectedRoom.capacity})</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedRoom.capacity}
                        value={hotelBookingForm.numberOfGuests}
                        onChange={(e) => setHotelBookingForm({ ...hotelBookingForm, numberOfGuests: Number(e.target.value) })}
                        className="w-full bg-[#253745] rounded-md px-3 py-2 text-sm outline-none text-white"
                      />
                      {hotelBookingForm.numberOfGuests > selectedRoom.capacity && (
                        <p className="text-xs text-red-400 mt-1">Exceeds room's guest capacity.</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm text-gray-400">
                        {hotelNights > 0 ? `${hotelNights} night${hotelNights > 1 ? "s" : ""}` : "—"}
                      </span>
                      <span className="text-lg font-semibold text-[#00C896]">
                        LKR {hotelTotalPrice.toLocaleString()}
                      </span>
                    </div>
                    {hotelBookingError && <p className="text-xs text-red-400 -mt-1">{hotelBookingError}</p>}

                    <button
                        onClick={handleAddHotelToCart}
                        disabled={
                            roomsLoading ||
                            !hotelBookingForm.checkInDate ||
                            !hotelBookingForm.checkOutDate ||
                            hotelNights <= 0 ||
                            hotelBookingForm.numberOfGuests > selectedRoom.capacity
                        }
                        className="w-full bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {roomsLoading ? "Checking..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default TourPreview;