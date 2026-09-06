import { API_BASE_URL } from "../../config/api";
import html2canvas from "html2canvas";
import React, { useState, useEffect, useRef } from "react";
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

const isValidCoordinate = (coord) =>
  Array.isArray(coord) &&
  coord.length >= 2 &&
  Number.isFinite(Number(coord[0])) &&
  Number.isFinite(Number(coord[1]));

const getCoordFromStop = (stop) => {
  if (!stop) return null;
  if (Array.isArray(stop) && stop.length >= 2) return [Number(stop[0]), Number(stop[1])];
  if (stop.lat != null && stop.lng != null) return [Number(stop.lat), Number(stop.lng)];
  if (stop.latitude != null && stop.longitude != null) return [Number(stop.latitude), Number(stop.longitude)];
  if (stop.location?.lat != null && stop.location?.lng != null) return [Number(stop.location.lat), Number(stop.location.lng)];
  return null;
};

const safeJsonParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
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
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    }
  }, [positions, map]);
  return null;
};

const CaptureMapRef = ({ mapInstanceRef }) => {
  const map = useMap();

  useEffect(() => {
    mapInstanceRef.current = map;
  }, [map, mapInstanceRef]);

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
  const [modalView, setModalView] = useState("list");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [checkingGuideAvailability, setCheckingGuideAvailability] = useState(false);
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
  const mapWrapperRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [startingTour, setStartingTour] = useState(false);
  const [startTourError, setStartTourError] = useState("");

  const calculateTripEndDate = (startDate, days) => {
    if (!startDate || !days) return "";
    const date = new Date(`${startDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + Math.max(0, Number(days) - 1));
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

      const parsedTrip = safeJsonParse(saved);
      const selectedDestinations = Array.isArray(parsedTrip?.selectedDestinations)
        ? parsedTrip.selectedDestinations
        : [];
      const district = parsedTrip?.startDistrict;
      const savedDuration = parsedTrip?.tripDurationDays;

      if (selectedDestinations.length === 0 || !district) {
        setError("Your saved trip details are incomplete. Please select your destinations again.");
        setPhase("error");
        navigate("/tours/plan");
        return;
      }

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

      const initialDays = Math.max(
        1,
        Number(savedDuration || sessionStorage.getItem("tourTripDuration") || 1)
      );
      const destinationIds = selectedDestinations
        .map((d) => d?._id || d?.id)
        .filter(Boolean);

      if (destinationIds.length === 0) {
        setError("No valid destinations were found. Please select your destinations again.");
        setPhase("error");
        navigate("/tours/plan");
        return;
      }

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
    return <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">Checking your trip against your selected days...</div>;
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-[#11212D] text-white flex flex-col items-center justify-center text-center px-6">
        <p className="mb-4">{error || "Unable to load the data"}</p>
        <button onClick={() => navigate("/tours/plan")} className="text-[#00C896] text-sm underline">← Change your destinations</button>
      </div>
    );
  }

  if (phase === "building-route") {
    return <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">Generating your trip route...</div>;
  }

  if (phase === "route-options") {
    if (!routeOptions) {
      return <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">Loading route options...</div>;
    }

    const optionKeys = ["shortestDistance", "fastestRoute", "bestOverall"];

    return (
      <div className="min-h-screen bg-[#11212D] text-white">
        <Navbar />
        <div className="px-6 py-10 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Choose Your Trip Style</h1>
          <p className="text-gray-400 mb-8">We've put together a few different ways to run this trip — pick the one that fits you best.</p>

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

                  <button
                    onClick={() => handleSelectRouteOption(key)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold py-2.5 rounded-md hover:bg-[#00b386] transition-colors mt-auto"
                  >
                    <Route size={12} /> Choose this trip
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tripData) {
    return <div className="min-h-screen bg-[#11212D] text-white flex items-center justify-center">Loading your trip...</div>;
  }

  const { destinations = [], route = {}, recommendations = [], itinerary = [] } = tripData || {};
  const routableStops = Array.isArray(route.routableStops) ? route.routableStops : [];
  const polylinePositions = Array.isArray(route.geometry) ? route.geometry.filter(isValidCoordinate).map((p) => [Number(p[0]), Number(p[1])]) : [];
  const returnPolylinePositions = Array.isArray(route.returnGeometry) ? route.returnGeometry.filter(isValidCoordinate).map((p) => [Number(p[0]), Number(p[1])]) : [];

  const startCoordCandidate = startCoords && startCoords.lat != null && startCoords.lng != null ? [Number(startCoords.lat), Number(startCoords.lng)] : null;
  const startCoord = (isValidCoordinate(startCoordCandidate) ? startCoordCandidate : null) || getCoordFromStop(routableStops[0]) || (polylinePositions.length > 0 ? polylinePositions[0] : null);

  const geometryMatchesStart = startCoord && polylinePositions.length > 0 && haversineKm(startCoord[0], startCoord[1], polylinePositions[0][0], polylinePositions[0][1]) <= 0.5;
  const safePolylinePositions = startCoord && !geometryMatchesStart ? [startCoord, ...polylinePositions] : polylinePositions;
  const allMapPositions = [...safePolylinePositions, ...returnPolylinePositions];

  const legDistances = destinations.map((dest, index) => {
    const prevCoord = index === 0 ? startCoord : [destinations[index - 1]?.latitude, destinations[index - 1]?.longitude];
    if (!isValidCoordinate(prevCoord) || !isValidCoordinate([dest?.latitude, dest?.longitude])) return null;
    return haversineKm(Number(prevCoord[0]), Number(prevCoord[1]), Number(dest.latitude), Number(dest.longitude));
  });

  const centerLat = allMapPositions.length > 0 ? allMapPositions.reduce((sum, p) => sum + p[0], 0) / allMapPositions.length : 7.8731;
  const centerLng = allMapPositions.length > 0 ? allMapPositions.reduce((sum, p) => sum + p[1], 0) / allMapPositions.length : 80.7718;

  const getRecommendationForLocation = (location) => {
    if (!location || !Array.isArray(recommendations)) return undefined;
    const normalizedLocation = String(location).toLowerCase().trim();
    return recommendations.find((rec) => String(rec?.location || "").toLowerCase().trim() === normalizedLocation);
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
      mobile: selectedGuide.mobile,
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

  const tripDays = Math.max(1, Number(tripDurationDays) || 1);
  const closeTransportModal = () => {
    setActiveTransportModal(null);
    setTransportModalView("list");
    setSelectedTransport(null);
    setTransportBookingError("");
    setTransportBookingForm({
      pickupDate: tripStartDate || "",
      returnDate: calculateTripEndDate(tripStartDate, tripDays),
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
    if (!selectedTransport) {
      setTransportBookingError("Please select a vehicle first");
      return;
    }
    const price = estimatedPrice || selectedTransport.pricePerDay || 5000;
    const cartItem = {
      cartId: `transport-${selectedTransport._id}-${Date.now()}`,
      vehicleId: selectedTransport._id,
      pickupLocation: startDistrict,
      dropoffLocation: activeTransportModal.location,
      pickup: startCoords ? { lat: Number(startCoords.lat), lng: Number(startCoords.lng) } : { lat: Number(destinations[0].latitude), lng: Number(destinations[0].longitude) },
      destination: { lat: Number(destinations[destinations.length - 1].latitude), lng: Number(destinations[destinations.length - 1].longitude) },
      pickupDate: transportBookingForm.pickupDate,
      returnDate: transportBookingForm.returnDate,
      numberOfGuests: transportBookingForm.numberOfGuests,
      bags: transportBookingForm.bags,
      totalPrice: price,
      vehicleBrand: selectedTransport.vehicleBrand,
      vehicleModel: selectedTransport.vehicleModel,
      registrationNo: selectedTransport.registrationNo,
      displayName: `${selectedTransport.vehicleBrand} ${selectedTransport.vehicleModel}`,
    };

    setCart((prev) => ({ ...prev, transports: [...prev.transports, cartItem] }));
    setBookedTransportIds((prev) => new Set(prev).add(selectedTransport._id));
    setTransportBudget((prev) => prev + price);
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
    setHotelBookingForm({ checkInDate: "", checkOutDate: "", numberOfGuests: tripGuestCount || 1 });
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
    if (!selectedRoom || hotelNights <= 0) {
      setHotelBookingError("Please select a room and valid check-in/check-out dates.");
      return;
    }

    const dayIndex = activeHotelModal?.dayIndex ?? 0;
    const cartItem = {
      cartId: `hotel-${selectedRoom._id}-${Date.now()}`,
      hotelId: selectedHotel._id,
      roomId: selectedRoom._id,
      checkInDate: hotelBookingForm.checkInDate,
      checkOutDate: hotelBookingForm.checkOutDate,
      numberOfGuests: hotelBookingForm.numberOfGuests,
      totalPrice: hotelTotalPrice,
      dayIndex,
      hotelName: selectedHotel.hotelName,
      location: selectedHotel.location,
      roomType: selectedRoom.roomType,
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

  const drawMarkersOnCanvas = (canvas) => {
    const map = mapInstanceRef.current;
    if (!map || !mapWrapperRef.current) return;
    const ctx = canvas.getContext("2d");
    const clientWidth = mapWrapperRef.current.clientWidth || 1;
    const canvasScale = canvas.width / clientWidth;

    const drawMarker = (lat, lng, label, isStart) => {
      try {
        const point = map.latLngToContainerPoint([lat, lng]);
        const x = point.x * canvasScale;
        const y = point.y * canvasScale;
        const radius = (isStart ? 17 : 15) * canvasScale;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isStart ? "#FFB020" : "#00C896";
        ctx.fill();
        ctx.lineWidth = 3 * canvasScale;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#11212D";
        ctx.font = `bold ${14 * canvasScale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
      } catch (err) {
        console.error("Canvas draw marker error:", err);
      }
    };

    if (startCoord && isValidCoordinate(startCoord)) {
      drawMarker(Number(startCoord[0]), Number(startCoord[1]), "S", true);
    }
    destinations.forEach((dest, index) => {
      if (isValidCoordinate([dest?.latitude, dest?.longitude])) {
        drawMarker(Number(dest.latitude), Number(dest.longitude), String(index + 1), false);
      }
    });
  };

  const handleStartTour = async () => {
    setStartTourError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUserRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = safeJsonParse(storedUserRaw);
    const travelerId = storedUser?._id;

    if (!token || !travelerId) {
      setStartTourError("Please login as a traveler to start your tour");
      return;
    }

    setStartingTour(true);
    let mapImageUrl = null;
    if (mapWrapperRef.current) {
      try {
        const canvas = await html2canvas(mapWrapperRef.current, { useCORS: true, scale: 2 });
        drawMarkersOnCanvas(canvas);
        mapImageUrl = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Could not capture map image:", err);
      }
    }

    let tourId = null;
    try {
      const tourRes = await axios.post(
        `${API_BASE_URL}/api/tour`,
        {
          destinations: destinations.map((d, i) => {
            const dayInfo = getDayInfoForDestination(d, i);
            return {
              id: d.id || `stop-${i}`,
              name: d.name || `Stop ${i + 1}`,
              location: d.location,
              latitude: d.latitude,
              longitude: d.longitude,
              order: i,
              day: dayInfo.dayNumber,
            };
          }),
          routeGeometry: JSON.stringify(route),
          totalDistanceKm: route.distanceKm,
          tripStartDate,
          tripDurationDays,
          estimatedBudget: guideBudget + transportBudget + hotelBudget,
          guideBudget,
          hotelBudget,
          transportBudget,
          routeMapImage: mapImageUrl,
          startLocation: startCoords ? { address: startCoords.address, latitude: startCoords.lat, longitude: startCoords.lng } : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tourId = tourRes.data._id;
      clearTrip();
    } catch (err) {
      console.error("Failed to create tour:", err.response?.data);
      setStartTourError(err.response?.data?.message || "Failed to start tour");
      setStartingTour(false);
      return;
    }

    const successfulGuides = [];
    const successfulTransports = [];
    const successfulHotels = [];

    for (const item of cart.guides) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/guidebooking`,
          { ...item, tourId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successfulGuides.push(item);
      } catch (err) {
        console.error("Guide booking save failed:", err);
      }
    }

    for (const item of cart.transports) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/transport/bookings`,
          { ...item, travelerId, tourId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successfulTransports.push(item);
      } catch (err) {
        console.error("Transport booking save failed:", err);
      }
    }

    for (const item of cart.hotels) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/booking/create`,
          { ...item, travelerId, tourId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successfulHotels.push(item);
      } catch (err) {
        console.error("Hotel booking save failed:", err);
      }
    }

    const finalGuideBudget = successfulGuides.reduce((sum, g) => sum + g.totalPrice, 0);
    const finalHotelBudget = successfulHotels.reduce((sum, h) => sum + h.totalPrice, 0);
    const finalTransportBudget = successfulTransports.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalEstBudget = finalGuideBudget + finalHotelBudget + finalTransportBudget;

    const guideBookingDetails = successfulGuides[0] ? {
      name: successfulGuides[0].displayName,
      mobile: successfulGuides[0].mobile,
      date: successfulGuides[0].date,
      quantity: successfulGuides[0].quantity,
      numberOfGuests: successfulGuides[0].numberOfGuests,
      totalPrice: successfulGuides[0].totalPrice,
      currency: successfulGuides[0].currency,
    } : undefined;

    const hotelBookingDetails = successfulHotels.map((h) => ({
      hotelName: h.hotelName,
      location: h.location,
      roomType: h.roomType,
      checkInDate: h.checkInDate,
      checkOutDate: h.checkOutDate,
      numberOfGuests: h.numberOfGuests,
      totalPrice: h.totalPrice,
    }));

    const transportBookingDetails = successfulTransports[0] ? {
      vehicleBrand: successfulTransports[0].vehicleBrand,
      vehicleModel: successfulTransports[0].vehicleModel,
      registrationNo: successfulTransports[0].registrationNo,
      pickupDate: successfulTransports[0].pickupDate,
      returnDate: successfulTransports[0].returnDate,
      numberOfGuests: successfulTransports[0].numberOfGuests,
      bags: successfulTransports[0].bags,
      totalPrice: successfulTransports[0].totalPrice,
    } : undefined;

    if (tourId) {
      try {
        await axios.put(
          `${API_BASE_URL}/api/tour/${tourId}/confirm`,
          {
            selectedGuide: successfulGuides[0]?.guideId,
            selectedHotels: successfulHotels.map((h) => h.hotelId),
            selectedTransport: successfulTransports[0]?.vehicleId,
            estimatedBudget: totalEstBudget,
            guideBudget: finalGuideBudget,
            hotelBudget: finalHotelBudget,
            transportBudget: finalTransportBudget,
            guideBookingDetails,
            hotelBookingDetails,
            transportBookingDetails,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.post(`${API_BASE_URL}/api/tour/send-summary`, {
          tourId,
          travelerId,
          destinations,
          guideBookings: successfulGuides,
          hotelBookings: successfulHotels,
          transportBookings: successfulTransports,
          guideBudget: finalGuideBudget,
          hotelBudget: finalHotelBudget,
          transportBudget: finalTransportBudget,
          totalBudget: totalEstBudget,
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Tour confirmation/summary error:", err);
      }
    }

    setStartingTour(false);
    navigate("/tours");
  };

  return (
    <div className="min-h-screen bg-[#11212D] text-white">
      <Navbar />
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Your Trip Route & Bookings</h1>
        <p className="text-gray-400 mb-6">
          Total distance: <span className="text-[#00C896] font-semibold">{route.distanceKm} km</span> | Driving time: <span className="text-[#00C896] font-semibold">{formatDuration(route.durationMin)}</span>
        </p>

        <div className="relative z-0 rounded-xl overflow-hidden mb-8" style={{ height: "450px" }} ref={mapWrapperRef}>
          <MapContainer center={[centerLat, centerLng]} zoom={8} maxBounds={SRI_LANKA_BOUNDS} maxBoundsViscosity={1.0} style={{ height: "100%", width: "100%" }}>
            <FitRouteBounds positions={allMapPositions} />
            <CaptureMapRef mapInstanceRef={mapInstanceRef} />
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" crossOrigin={true} />
            {startCoord && (
              <Marker position={startCoord} icon={createStartIcon()}>
                <Popup><strong>Start — {startCoords?.address || startDistrict}</strong></Popup>
              </Marker>
            )}
            {destinations.map((stop, index) => {
              const pos = isValidCoordinate([stop?.latitude, stop?.longitude]) ? [Number(stop.latitude), Number(stop.longitude)] : null;
              if (!pos) return null;
              return (
                <Marker key={stop.id || stop._id || index} position={pos} icon={createNumberedIcon(index + 1)}>
                  <Popup><strong>{index + 1}. {stop.name}</strong><br />{stop.location}</Popup>
                </Marker>
              );
            })}
            <Polyline positions={safePolylinePositions} pathOptions={{ color: "#00C896", weight: 5 }} />
            {returnPolylinePositions.length > 0 && (
              <Polyline positions={returnPolylinePositions} pathOptions={{ color: "#FFB020", weight: 5, dashArray: "8, 8" }} />
            )}
          </MapContainer>
        </div>

        {/* Start Location & Stops Recommendation Section */}
        <div className="mb-8 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Itinerary & Add-on Bookings</h2>
          {(() => {
            const startRec = getRecommendationForLocation(startDistrict);
            const startGuides = startRec?.guides || [];
            const startHotels = startRec?.hotels || [];
            const startTransports = startRec?.transports || [];
            return (
              <div className="bg-[#253745] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#00C896] font-medium text-sm">Start: {startCoords?.address || startDistrict}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655]" onClick={() => startRec && setActiveGuideModal({ location: startRec.location, guides: startGuides })}>
                    <p className="text-sm font-medium flex items-center gap-2"><FaUserTie className="text-[#00C896]" /> Guides ({startGuides.length})</p>
                    <p className="text-xs text-gray-400 mt-1">Click to select guide</p>
                  </div>
                  <div className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655]" onClick={() => startRec && setActiveHotelModal({ location: startRec.location, hotels: startHotels, dayIndex: 0 })}>
                    <p className="text-sm font-medium flex items-center gap-2"><FaHotel className="text-[#00C896]" /> Hotels ({startHotels.length})</p>
                    <p className="text-xs text-gray-400 mt-1">Click to book hotel</p>
                  </div>
                  <div className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655]" onClick={() => startRec && setActiveTransportModal({ location: startRec.location, transports: startTransports })}>
                    <p className="text-sm font-medium flex items-center gap-2"><FaCar className="text-[#00C896]" /> Transport ({startTransports.length})</p>
                    <p className="text-xs text-gray-400 mt-1">Click to book vehicle</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {destinations.map((dest, index) => {
            const dayInfo = getDayInfoForDestination(dest, index);
            const destRec = getRecommendationForLocation(dest.location);
            const destHotels = destRec?.hotels || [];
            return (
              <div key={dest.id || index} className="bg-[#253745] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <span className="font-medium text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#00C896]/10 text-[#00C896] text-xs font-bold flex items-center justify-center">{index + 1}</span>
                    {dest.name}
                  </span>
                  {dayInfo.timeSlot && <p className="text-xs text-gray-400 mt-1 ml-8">{dayInfo.timeSlot}</p>}
                </div>
                {dayInfo.isDayEnd && (
                  <div className="bg-[#1a2530] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655]" onClick={() => destRec && setActiveHotelModal({ location: destRec.location, hotels: destHotels, dayIndex: dayInfo.dayNumber })}>
                    <p className="text-sm font-medium flex items-center gap-2"><FaHotel className="text-[#00C896]" /> Hotels ({destHotels.length})</p>
                    <p className="text-xs text-gray-400 mt-1">Book accommodation for Day {dayInfo.dayNumber}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cart & Budget Summary */}
        <div className="bg-[#253745] rounded-xl p-5 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><FaShoppingCart className="text-[#00C896]" /> Cart ({totalCartItems})</h3>
          {cart.guides.map((item) => (
            <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded px-3 py-2 mb-2 text-sm">
              <span>Guide: {item.displayName} ({item.quantity} days)</span>
              <div className="flex items-center gap-3">
                <span className="text-[#00C896] font-semibold">LKR {item.totalPrice.toLocaleString()}</span>
                <button onClick={() => removeGuideFromCart(item.cartId)} className="text-red-400 hover:text-red-300"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
          {cart.transports.map((item) => (
            <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded px-3 py-2 mb-2 text-sm">
              <span>Vehicle: {item.displayName}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#00C896] font-semibold">LKR {item.totalPrice.toLocaleString()}</span>
                <button onClick={() => removeTransportFromCart(item.cartId)} className="text-red-400 hover:text-red-300"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
          {cart.hotels.map((item) => (
            <div key={item.cartId} className="flex justify-between items-center bg-[#1a2530] rounded px-3 py-2 mb-2 text-sm">
              <span>Hotel: {item.displayName}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#00C896] font-semibold">LKR {item.totalPrice.toLocaleString()}</span>
                <button onClick={() => removeHotelFromCart(item.cartId)} className="text-red-400 hover:text-red-300"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#253745] rounded-xl p-5 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Estimated Total Budget</h3>
            <p className="text-xs text-gray-400">Guides: LKR {guideBudget.toLocaleString()} | Hotels: LKR {hotelBudget.toLocaleString()} | Transport: LKR {transportBudget.toLocaleString()}</p>
          </div>
          <span className="text-2xl font-bold text-[#00C896]">LKR {(guideBudget + transportBudget + hotelBudget).toLocaleString()}</span>
        </div>

        {startTourError && <p className="text-sm text-red-400 mb-3">{startTourError}</p>}
        <button
          onClick={handleStartTour}
          disabled={startingTour}
          className="w-full flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold py-3 rounded-full hover:bg-[#00b386] transition-colors disabled:opacity-50"
        >
          <FaPlay size={12} /> {startingTour ? "Starting Tour..." : "Start Tour & Generate Summary"}
        </button>
      </div>

      {/* Guide Modal */}
      {activeGuideModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={closeModal}>
          <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#00C896]">
                {modalView === "list" ? `Guides — ${activeGuideModal.location}` : "Book Guide"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {modalView === "list" ? (
              <div className="flex flex-col gap-3">
                {activeGuideModal.guides.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No guides available.</p>
                ) : (
                  activeGuideModal.guides.map((g) => (
                    <div key={g._id} className="bg-[#253745] rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{g.firstName} {g.lastName}</p>
                        <p className="text-xs text-gray-400">{g.currency} {g.pricePerDay} / day</p>
                      </div>
                      <button onClick={() => { setSelectedGuide(g); setModalView("form"); setBookingForm({ date: tripStartDate || "", durationType: "daily", quantity: tripDurationDays || 1, numberOfGuests: tripGuestCount || 1, message: "" }); }} className="bg-[#00C896] text-[#11212D] text-xs px-3 py-1.5 rounded font-semibold">Select</button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookingError && <p className="text-xs text-red-400">{bookingError}</p>}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date</label>
                  <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Days</label>
                  <input type="number" min="1" value={bookingForm.quantity} onChange={(e) => setBookingForm({ ...bookingForm, quantity: Math.max(1, Number(e.target.value)) })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex justify-between items-center bg-[#253745] p-3 rounded mt-2">
                  <span className="text-xs text-gray-400">Total Price:</span>
                  <span className="text-sm font-bold text-[#00C896]">{selectedGuide?.currency} {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setModalView("list")} className="flex-1 bg-gray-600 text-white text-xs py-2 rounded">Back</button>
                  <button onClick={handleAddGuideToCart} className="flex-1 bg-[#00C896] text-[#11212D] text-xs font-semibold py-2 rounded">Add to Cart</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transport Modal */}
      {activeTransportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={closeTransportModal}>
          <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#00C896]">
                {transportModalView === "list" ? `Transport — ${activeTransportModal.location}` : "Book Vehicle"}
              </h3>
              <button onClick={closeTransportModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {transportModalView === "list" ? (
              <div className="flex flex-col gap-3">
                {activeTransportModal.transports.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No vehicles available.</p>
                ) : (
                  activeTransportModal.transports.map((t) => (
                    <div key={t._id} className="bg-[#253745] rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{t.vehicleBrand} {t.vehicleModel}</p>
                        <p className="text-xs text-gray-400">Capacity: {t.passengerCapacity} pax</p>
                      </div>
                      <button onClick={async () => { setSelectedTransport(t); setTransportModalView("form"); await fetchTransportEstimate(t._id); }} className="bg-[#00C896] text-[#11212D] text-xs px-3 py-1.5 rounded font-semibold">Select</button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {transportBookingError && <p className="text-xs text-red-400">{transportBookingError}</p>}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Pickup Date</label>
                  <input type="date" value={transportBookingForm.pickupDate} onChange={(e) => setTransportBookingForm({ ...transportBookingForm, pickupDate: e.target.value })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Return Date</label>
                  <input type="date" value={transportBookingForm.returnDate} onChange={(e) => setTransportBookingForm({ ...transportBookingForm, returnDate: e.target.value })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex justify-between items-center bg-[#253745] p-3 rounded mt-2">
                  <span className="text-xs text-gray-400">Estimated Price:</span>
                  <span className="text-sm font-bold text-[#00C896]">LKR {(estimatedPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setTransportModalView("list")} className="flex-1 bg-gray-600 text-white text-xs py-2 rounded">Back</button>
                  <button onClick={handleAddTransportToCart} className="flex-1 bg-[#00C896] text-[#11212D] text-xs font-semibold py-2 rounded">Add to Cart</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hotel Modal */}
      {activeHotelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={closeHotelModal}>
          <div className="bg-[#1B2B34] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#00C896]">
                {hotelModalView === "list" ? `Hotels — ${activeHotelModal.location}` : selectedRoom ? "Book Room" : "Select Room"}
              </h3>
              <button onClick={closeHotelModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {hotelModalView === "list" ? (
              <div className="flex flex-col gap-3">
                {activeHotelModal.hotels.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No hotels available.</p>
                ) : (
                  activeHotelModal.hotels.map((h) => (
                    <div key={h._id} className="bg-[#253745] rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{h.hotelName}</p>
                        <p className="text-xs text-gray-400">{h.location}</p>
                      </div>
                      <button onClick={async () => { setSelectedHotel(h); setHotelModalView("rooms"); await fetchRoomsForHotel(h._id); }} className="bg-[#00C896] text-[#11212D] text-xs px-3 py-1.5 rounded font-semibold">View Rooms</button>
                    </div>
                  ))
                )}
              </div>
            ) : hotelModalView === "rooms" ? (
              <div className="flex flex-col gap-3">
                {roomsLoading ? <p className="text-xs text-center py-4">Loading rooms...</p> : hotelRooms.length === 0 ? <p className="text-xs text-center py-4">No rooms available.</p> : (
                  hotelRooms.map((r) => (
                    <div key={r._id} className="bg-[#253745] rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{r.roomType}</p>
                        <p className="text-xs text-[#00C896]">LKR {r.pricePerNight} / night</p>
                      </div>
                      <button onClick={() => { setSelectedRoom(r); setHotelModalView("form"); setHotelBookingForm({ checkInDate: tripStartDate || "", checkOutDate: calculateTripEndDate(tripStartDate, 1), numberOfGuests: 1 }); }} className="bg-[#00C896] text-[#11212D] text-xs px-3 py-1.5 rounded font-semibold">Select</button>
                    </div>
                  ))
                )}
                <button onClick={() => setHotelModalView("list")} className="mt-2 bg-gray-600 text-white text-xs py-2 rounded">Back to Hotels</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {hotelBookingError && <p className="text-xs text-red-400">{hotelBookingError}</p>}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Check-in Date</label>
                  <input type="date" value={hotelBookingForm.checkInDate} onChange={(e) => setHotelBookingForm({ ...hotelBookingForm, checkInDate: e.target.value })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Check-out Date</label>
                  <input type="date" value={hotelBookingForm.checkOutDate} onChange={(e) => setHotelBookingForm({ ...hotelBookingForm, checkOutDate: e.target.value })} className="w-full bg-[#253745] border border-gray-600 rounded px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex justify-between items-center bg-[#253745] p-3 rounded mt-2">
                  <span className="text-xs text-gray-400">Total ({hotelNights} nights):</span>
                  <span className="text-sm font-bold text-[#00C896]">LKR {hotelTotalPrice.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setHotelModalView("rooms")} className="flex-1 bg-gray-600 text-white text-xs py-2 rounded">Back</button>
                  <button onClick={handleAddHotelToCart} className="flex-1 bg-[#00C896] text-[#11212D] text-xs font-semibold py-2 rounded">Add to Cart</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TourPreview;