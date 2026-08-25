import { API_BASE_URL } from "../../config/api";
// pages/Tour/TourPreview.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle, FaShoppingCart, FaTrash, FaPlay } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Navbar from "../../components/Navbar"; // ⚠️ path eka check karanna
import Footer from "../../components/Footer";

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
  const [checkingGuideAvailability, setCheckingGuideAvailability] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    date: "",
    durationType: "daily",
    quantity: 1,
    numberOfGuests: 1,
    message: "",
  });
  const [startDistrict, setStartDistrict] = useState(null);

  // TourPage eke user select kala trip start date eka methanata gennawa
  const [tripStartDate, setTripStartDate] = useState("");

  // --- Transport booking modal state ---
  const [activeTransportModal, setActiveTransportModal] = useState(null); // { location, transports }
  const [transportModalView, setTransportModalView] = useState("list"); // "list" | "book"
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

  // --- Hotel booking modal state ---
  const [activeHotelModal, setActiveHotelModal] = useState(null); // { location, hotels, dayIndex }
  const [hotelModalView, setHotelModalView] = useState("list"); // "list" | "rooms" | "book"
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
  const [hotelStayDates, setHotelStayDates] = useState({}); // { [dayIndex]: checkOutDate } — cart chain eka

  // --- "Added to cart" tracking (tick mark eka pennanna) ---
  const [bookedGuideIds, setBookedGuideIds] = useState(new Set());
  const [bookedTransportIds, setBookedTransportIds] = useState(new Set());
  const [bookedRoomIds, setBookedRoomIds] = useState(new Set());

  const [guideBudget, setGuideBudget] = useState(0);
  const [transportBudget, setTransportBudget] = useState(0);
  const [hotelBudget, setHotelBudget] = useState(0);

  // --- Cart eka — "Start Tour" click karana welawata witharai backend ekata yanne ---
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

      const destinationIds = selectedDestinations.map((d) => d._id);

      if (!startDistrict) {
        setError("Select your starting district first");
        setLoading(false);
        navigate("/tours");
        return;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/tour/generate-trip`, {
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

  const { destinations, route, recommendations } = tripData || [];
  const routableStops = route?.routableStops || [];
  const polylinePositions = route.geometry || [];
  const returnPolylinePositions = route.returnGeometry || [];
  const allMapPositions = [...polylinePositions, ...returnPolylinePositions];

  const centerLat = allMapPositions.length > 0
    ? allMapPositions.reduce((sum, p) => sum + p[0], 0) / allMapPositions.length
    : 7.8731;
  const centerLng = allMapPositions.length > 0
    ? allMapPositions.reduce((sum, p) => sum + p[1], 0) / allMapPositions.length
    : 80.7718;

  const getDestinationDayIndex = (location) => {
    const idx = destinations.findIndex(
      (d) => d.location?.toLowerCase().trim() === location?.toLowerCase().trim()
    );
    return idx >= 0 ? idx : 0;
  };

  const getMinCheckInDate = (dayIndex) => {
    if (dayIndex === 0) return tripStartDate; // start destination eka trip start date ekata kalin epa
    return hotelStayDates[dayIndex - 1] || tripStartDate; // eelaga destination eka — kalin eke checkout date eka
  };

  // --- Guide booking modal helpers ---
  const closeModal = () => {
    setActiveGuideModal(null);
    setModalView("list");
    setSelectedGuide(null);
    setShowPhoneNumber(false);
    setBookingError("");
    setBookingForm({ date: "", durationType: "daily", quantity: 1, numberOfGuests: 1, message: "" });
  };

  const totalPrice = selectedGuide ? bookingForm.quantity * selectedGuide.pricePerDay : 0;

  // Backend ekata direct request yanne na dæන් — cart ekකට witharai add karanawa
  // Backend ekata direct request yanne na dæন් — cart ekකට witharai add karanawa, ehet availability check karala

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

    // Cart eke dæනටම mee guide ma innawada, date overlap wenawada check karanawa
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

    // Backend eke confirmed/pending bookings check karanawa
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

  // --- Transport booking modal helpers ---
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

  // Backend ekata direct request yanne na dæන් — cart ekකට witharai add karanawa
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

  // Cart eke dæනටම mee vehicle ma innawada, date overlap wenawada check karanawa
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

  // Backend eke confirmed/pending bookings check karanawa
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
    pickup: {
      lat: destinations[0].latitude,
      lng: destinations[0].longitude,
    },
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

  // --- Hotel booking modal helpers ---
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

  // Backend ekata direct request yanne na dæน — cart ekකට witharai add karanawa
  // Backend ekata direct request yanne na dæน — cart ekකට witharai add karanawa, ehet availability check karala
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

    // Cart eke dæනටම mee room ma innawada, date overlap wenawada check karanawa
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

    // Backend eke confirmed bookings check karanawa
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

  // --- "Start Tour" click karama, cart eke okkoma backend ekata yanawa ---
  const totalCartItems = cart.guides.length + cart.transports.length + cart.hotels.length;

  const handleStartTour = async () => {
    setStartTourError("");
    setStartTourSuccess(false);

    if (totalCartItems === 0) {
      setStartTourError("Add at least one guide, hotel or vehicle to your cart before starting the tour");
      return;
    }

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
          destinations: destinations.map((d, i) => ({
            id: d.id || `stop-${i}`,
            name: d.name || d.district || `Stop ${i + 1}`,
            location: d.location,
            latitude: d.latitude,
            longitude: d.longitude,
            order: i,
          })),
          routeGeometry: JSON.stringify(route),
          totalDistanceKm: route.distanceKm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tourId = tourRes.data._id;
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
            pickup: item.pickup,
            destination: item.destination,
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
        <h1 className="text-2xl font-bold mb-2">Your Trip Route</h1>
        <p className="text-gray-400 mb-2">
          Total distance (round trip):{" "}
          <span className="text-[#00C896] font-semibold">{route.distanceKm} km</span>
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

        <div className="relative z-0 rounded-xl overflow-hidden mb-8" style={{ height: "450px" }}>
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
                <div className={`grid grid-cols-1 ${isStartLocation ? "md:grid-cols-3" : "md:grid-cols-1"} gap-4`}>
                  {isStartLocation && (
                    <div
                      className="bg-[#253745] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                      onClick={() => setActiveGuideModal({ location: rec.location, guides: rec.guides })}
                    >
                      <p className="text-sm font-medium mb-1 flex items-center gap-1">
                        Guides ({rec.guides.length})
                        {rec.guides.some((g) => bookedGuideIds.has(g._id)) && (
                          <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                        )}
                      </p>
                      {rec.guides.slice(0, 2).map((g) => (
                        <p key={g._id} className="text-xs text-gray-400">{g.firstName} {g.lastName}</p>
                      ))}
                      {rec.guides.length > 2 && (
                        <p className="text-xs text-[#00C896] mt-1">+{rec.guides.length - 2} more · click to view</p>
                      )}
                    </div>
                  )}
                  <div
                    className="bg-[#253745] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                    onClick={() =>
                      setActiveHotelModal({
                        location: rec.location,
                        hotels: rec.hotels,
                        dayIndex: getDestinationDayIndex(rec.location),
                      })
                    }
                  >
                    <p className="text-sm font-medium mb-1 flex items-center gap-1">
                      Hotels ({rec.hotels.length})
                      {hotelStayDates[getDestinationDayIndex(rec.location)] && (
                        <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                      )}
                    </p>
                    {rec.hotels.slice(0, 2).map((h) => (
                      <p key={h._id} className="text-xs text-gray-400">{h.hotelName}</p>
                    ))}
                    {rec.hotels.length > 2 && (
                      <p className="text-xs text-[#00C896] mt-1">+{rec.hotels.length - 2} more · click to view</p>
                    )}
                  </div>
                  {isStartLocation && (
                    <div
                      className="bg-[#253745] rounded-lg p-3 cursor-pointer hover:bg-[#2f4655] transition-colors"
                      onClick={() => setActiveTransportModal({ location: rec.location, transports: rec.transports })}
                    >
                      <p className="text-sm font-medium mb-1 flex items-center gap-1">
                        Transport ({rec.transports.length})
                        {rec.transports.some((t) => bookedTransportIds.has(t._id)) && (
                          <FaCheckCircle className="text-[#00C896] text-[11px]" title="Added to cart" />
                        )}
                      </p>
                      {rec.transports.slice(0, 2).map((t) => (
                        <p key={t._id} className="text-xs text-gray-400">{t.vehicleBrand} {t.vehicleModel}</p>
                      ))}
                      {rec.transports.length > 2 && (
                        <p className="text-xs text-[#00C896] mt-1">+{rec.transports.length - 2} more · click to view</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Cart eka --- */}
        {totalCartItems > 0 && (
          <div className="mt-10 bg-[#253745] rounded-xl p-5">
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

        <div className="mt-6 bg-[#253745] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
          disabled={startingTour || totalCartItems === 0}
          className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold px-8 py-3 rounded-full hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlay size={12} />
          {startingTour ? "Starting Tour..." : "Start Tour"}
        </button>

        {/* --- Guide booking modal --- */}
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
                          <h4 className="text-white font-semibold text-sm truncate flex items-center gap-1">
                            {g.firstName} {g.lastName}
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

        {/* --- Transport booking modal --- */}
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
                        <h4 className="text-white font-semibold text-sm truncate flex items-center gap-1">
                          {t.vehicleBrand} {t.vehicleModel}
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
                      <p className="text-xs text-gray-500 mt-1">Vehicle returns you to {startDistrict} — price includes the full round trip.</p>
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

        {/* --- Hotel booking modal --- */}
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
                            alt={r.roomType}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate flex items-center gap-1">
                              {r.roomType} · Room {r.roomNumber}
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

                  <div className="flex items-center gap-3 mb-4">
                    <img src={selectedRoom.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium">{selectedRoom.roomType} · Room {selectedRoom.roomNumber}</p>
                      <p className="text-xs text-gray-400">{selectedHotel?.hotelName}</p>
                    </div>
                  </div>

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