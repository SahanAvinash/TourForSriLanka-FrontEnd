import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { MapPin, Route, Users, Compass, Download, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MapPickerModal from "../../components/MapPickerModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const districtOptions = [
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
].map((district) => ({
  value: district,
  label: district,
}));

const guestOptions = Array.from({ length: 10 }, (_, index) => index + 1).map(
  (number) => ({
    value: number,
    label: `${number} ${number === 1 ? "Guest" : "Guests"}`,
  })
);

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#253745",
    borderColor: state.isFocused ? "#00C896" : "#3a4b58",
    boxShadow: "none",
    padding: "2px",
    "&:hover": {
      borderColor: "#00C896",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#253745",
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#11212D" : "#253745",
    color: "#fff",
    cursor: "pointer",
  }),
};

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const drawRouteDiagram = (doc, boxX, boxY, boxWidth, boxHeight, destinations) => {
  const points = (destinations || []).filter(
    (destination) =>
      typeof destination.lat === "number" && typeof destination.lng === "number"
  );

  if (points.length < 2) return false;

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  const padding = 16;
  const innerWidth = boxWidth - padding * 2;
  const innerHeight = boxHeight - padding * 2;

  const project = (lat, lng) => {
    const px = boxX + padding + ((lng - minLng) / lngSpan) * innerWidth;
    const py = boxY + padding + (1 - (lat - minLat) / latSpan) * innerHeight;
    return [px, py];
  };

  doc.setFillColor(37, 55, 69);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "F");

  const coords = points.map((point) => project(point.lat, point.lng));

  doc.setDrawColor(0, 200, 150);
  doc.setLineWidth(0.7);
  doc.setLineDashPattern([], 0);

  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
  }

  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(
    coords[coords.length - 1][0],
    coords[coords.length - 1][1],
    coords[0][0],
    coords[0][1]
  );
  doc.setLineDashPattern([], 0);

  points.forEach((point, index) => {
    const [px, py] = coords[index];

    doc.setFillColor(0, 200, 150);
    doc.circle(px, py, 3.4, "F");

    doc.setTextColor(17, 33, 45);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, px, py + 1.1, { align: "center" });

    const label =
      point.name && point.name.length > 16
        ? `${point.name.slice(0, 15)}…`
        : point.name || "";

    const labelY = py + 7 > boxY + boxHeight - 3 ? py - 5 : py + 7;

    doc.setTextColor(225, 230, 235);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(label, px, labelY, { align: "center" });
  });

  return true;
};

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-[#253745] rounded-xl p-6 text-center tour-feature-card-anim ${
        isVisible ? "in-view" : ""
      }`}
      style={{
        animationDelay: isVisible ? `${delay}s` : "0s",
      }}
    >
      {icon}
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

const TourPage = () => {
  const navigate = useNavigate();

  const [startDistrict, setStartDistrict] = useState(() => {
    const saved = sessionStorage.getItem("tourStartDistrict");
    return saved ? { value: saved, label: saved } : null;
  });

  const [startDate, setStartDate] = useState(
    () => sessionStorage.getItem("tourStartDate") || ""
  );

  const [tripDuration, setTripDuration] = useState(
    () => sessionStorage.getItem("tourTripDuration") || ""
  );

  const [numberOfGuests, setNumberOfGuests] = useState(() => {
    const saved = sessionStorage.getItem("tourNumberOfGuests");
    if (!saved) return null;
    const number = Number(saved);
    return {
      value: number,
      label: `${number} ${number === 1 ? "Guest" : "Guests"}`,
    };
  });

  const [error, setError] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [startLocation, setStartLocation] = useState(() => {
    const savedAddress = sessionStorage.getItem("tourStartAddress");
    const savedLat = sessionStorage.getItem("tourStartLat");
    const savedLng = sessionStorage.getItem("tourStartLng");

    if (savedAddress && savedLat && savedLng) {
      return {
        address: savedAddress,
        lat: Number(savedLat),
        lng: Number(savedLng),
      };
    }
    return null;
  });

  const [activeTour, setActiveTour] = useState(null);
  const [showActiveTourDetails, setShowActiveTourDetails] = useState(false);

  useEffect(() => {
    if (startDistrict) {
      sessionStorage.setItem("tourStartDistrict", startDistrict.value);
    }
  }, [startDistrict]);

  useEffect(() => {
    if (startDate) {
      sessionStorage.setItem("tourStartDate", startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (tripDuration) {
      sessionStorage.setItem("tourTripDuration", tripDuration);
    }
  }, [tripDuration]);

  useEffect(() => {
    if (numberOfGuests) {
      sessionStorage.setItem("tourNumberOfGuests", String(numberOfGuests.value));
    }
  }, [numberOfGuests]);

  useEffect(() => {
    if (startLocation) {
      sessionStorage.setItem("tourStartAddress", startLocation.address);
      sessionStorage.setItem("tourStartLat", String(startLocation.lat));
      sessionStorage.setItem("tourStartLng", String(startLocation.lng));
    }
  }, [startLocation]);

  useEffect(() => {
    const fetchActiveTour = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/tour`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveTour(res.data.tours?.[0] || null);
      } catch (err) {
        console.error("Failed to fetch active tour:", err);
      }
    };

    fetchActiveTour();
  }, []);

  const handleMapConfirm = (location) => {
    setStartLocation(location);

    const matchedDistrict = districtOptions.find((district) =>
      location.address?.toLowerCase().includes(district.value.toLowerCase())
    );

    if (matchedDistrict) {
      setStartDistrict(matchedDistrict);
    }

    setError("");
    setShowMapPicker(false);
  };

  const handleStart = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      toast.error("Please login and try again");
      return;
    }

    if (!startLocation) {
      setError("Please pick your starting location on the map.");
      return;
    }

    if (!startDate) {
      setError("Please select your trip start date.");
      return;
    }

    if (!tripDuration || Number(tripDuration) <= 0) {
      setError("Please enter a valid trip duration in days.");
      return;
    }

    if (!numberOfGuests) {
      setError("Please select the number of guests.");
      return;
    }

    setError("");

    navigate("/tours/plan", {
      state: {
        startDistrict: startDistrict?.value,
        startDate,
        tripDuration: Number(tripDuration),
        numberOfGuests: numberOfGuests.value,
        startLat: startLocation.lat,
        startLng: startLocation.lng,
        startAddress: startLocation.address,
      },
    });
  };

  const handleDownloadPdf = () => {
    if (!activeTour) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const accent = [0, 200, 150];
    const dark = [17, 33, 45];
    let y = 0;

    const tripReference = `TSL-${activeTour._id || Date.now()}`
      .toString()
      .slice(0, 18)
      .toUpperCase();

    doc.setFillColor(...accent);
    doc.rect(0, 0, pageWidth, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Tour For Sri Lanka", 14, 14);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Your Trip Summary", 14, 23);

    y = 42;

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.text(`Trip Reference: ${tripReference}`, 14, y);
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      pageWidth - 14,
      y,
      { align: "right" }
    );

    y += 10;

    const overviewHeight = 30;
    doc.setFillColor(37, 55, 69);
    doc.roundedRect(14, y, pageWidth - 28, overviewHeight, 3, 3, "F");

    const budgetValue = activeTour.estimatedBudget || activeTour.budget || activeTour.totalCost || activeTour.totalPrice;

    const overviewRows = [
      [
        "Trip Start Date",
        activeTour.tripStartDate ? formatDate(activeTour.tripStartDate) : "-",
      ],
      [
        "Trip End Date",
        activeTour.tripEndDate ? formatDate(activeTour.tripEndDate) : "-",
      ],
      ["Destinations", `${activeTour.destinations?.length || 0}`],
      [
        "Total Distance",
        activeTour.totalDistanceKm ? `${activeTour.totalDistanceKm} km` : "-",
      ],
      [
        "Estimated Budget",
        budgetValue ? `LKR ${Number(budgetValue).toLocaleString()}` : "-",
      ],
    ];

    const columnWidth = (pageWidth - 28 - 24) / overviewRows.length;

    overviewRows.forEach(([label, value], index) => {
      const columnX = 20 + index * columnWidth;

      doc.setTextColor(160, 170, 180);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(label, columnX, y + 11);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text(value, columnX, y + 21, { maxWidth: columnWidth - 4 });
    });

    y += overviewHeight + 12;

    doc.setTextColor(...dark);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Trip Route", 14, y);

    y += 3;

    const routeRows = (activeTour.destinations || []).map(
      (destination, index) => [
        `${index + 1}`,
        destination.name || "-",
        destination.location || "-",
      ]
    );

    autoTable(doc, {
      startY: y + 4,
      head: [["#", "Destination", "Location"]],
      body: routeRows,
      theme: "striped",
      headStyles: {
        fillColor: accent,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    const mappedDestinations = (activeTour.destinations || []).map((d) => ({
      ...d,
      lat: d.latitude,
      lng: d.longitude,
    }));

    const hasRouteCoords =
      mappedDestinations.filter(
        (destination) =>
          typeof destination.lat === "number" &&
          typeof destination.lng === "number"
      ).length >= 2;

    if (hasRouteCoords) {
      if (y > 210) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...dark);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Route Map", 14, y);

      y += 4;

      const mapHeight = 70;
      drawRouteDiagram(doc, 14, y + 2, pageWidth - 28, mapHeight, mappedDestinations);

      y += mapHeight + 12;
    }

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(...dark);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Bookings", 14, y);

    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    if (activeTour.selectedGuide) {
      doc.text(
        `Guide: ${activeTour.selectedGuide.firstName || ""} ${
          activeTour.selectedGuide.lastName || ""
        }`.trim(),
        14,
        y
      );
      y += 7;
    }

    if (activeTour.selectedHotels?.length > 0) {
      activeTour.selectedHotels.forEach((hotel) => {
        doc.text(`Hotel: ${hotel.hotelName || "-"} (${hotel.location || "-"})`, 14, y);
        y += 7;
      });
    }

    if (activeTour.selectedTransport) {
      doc.text(
        `Vehicle: ${activeTour.selectedTransport.vehicleBrand || ""} ${
          activeTour.selectedTransport.vehicleModel || ""
        }`.trim(),
        14,
        y
      );
      y += 7;
    }

    if (
      !activeTour.selectedGuide &&
      !activeTour.selectedHotels?.length &&
      !activeTour.selectedTransport
    ) {
      doc.text("No guide, hotel or vehicle booked yet.", 14, y);
      y += 7;
    }

    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Tour For Sri Lanka — Booking requests are subject to confirmation by guides, hotels and vehicle owners.",
        14,
        290
      );
    }

    doc.save(`TourForSriLanka-Trip-Summary-${Date.now()}.pdf`);
  };

  const activeTourBudget = activeTour?.estimatedBudget || activeTour?.budget || activeTour?.totalCost || activeTour?.totalPrice;

  return (
    <div className="min-h-screen bg-[#11212D] text-white pt-28">
      <Navbar />

      {/* Active Tour Dropdown Accordion Section */}
      {activeTour && (
        <div className="max-w-4xl mx-auto mb-10 px-4">
          <div className="bg-[#1B2B34] border border-[#00C896]/30 rounded-xl p-5 shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00C896]/10 flex items-center justify-center flex-shrink-0">
                  <Compass size={18} className="text-[#00C896]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Your Tour</p>
                  <p className="text-xs text-gray-400">
                    {activeTour.tripStartDate && activeTour.tripEndDate
                      ? `${formatDate(activeTour.tripStartDate)} — ${formatDate(
                          activeTour.tripEndDate
                        )}`
                      : `${activeTour.destinations?.length || 0} destinations`}
                    {activeTourBudget && ` • LKR ${Number(activeTourBudget).toLocaleString()}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowActiveTourDetails((prev) => !prev)}
                className="text-sm font-semibold text-[#00C896] hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer self-start sm:self-center"
              >
                {showActiveTourDetails ? "See Less" : "See More"}
                {showActiveTourDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Dropdown Content inside the banner */}
            {showActiveTourDetails && (
              <div className="mt-5 pt-5 border-t border-white/10 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-white/10 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#00C896] flex items-center gap-2">
                      <Compass size={22} /> Your Booked Tour Details
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Trip Reference: TSL-{activeTour._id ? activeTour._id.slice(0, 10).toUpperCase() : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-[#00C896] text-[#11212D] font-semibold text-sm px-4 py-2.5 rounded-md hover:bg-[#00b386] transition-colors"
                  >
                    <Download size={16} />
                    Download as PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-[#11212D] rounded-lg p-4">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Trip Start</span>
                    <span className="text-white font-medium text-sm">
                      {activeTour.tripStartDate ? formatDate(activeTour.tripStartDate) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Trip End</span>
                    <span className="text-white font-medium text-sm">
                      {activeTour.tripEndDate ? formatDate(activeTour.tripEndDate) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Total Distance</span>
                    <span className="text-white font-medium text-sm">
                      {activeTour.totalDistanceKm ? `${activeTour.totalDistanceKm} km` : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Estimated Budget</span>
                    <span className="text-[#00C896] font-bold text-sm">
                      {activeTourBudget ? `LKR ${Number(activeTourBudget).toLocaleString()}` : "-"}
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Itinerary Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                    Trip Itinerary (Day by Day)
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(
                      (activeTour.destinations || []).reduce((acc, dest) => {
                        const day = dest.day || 1;
                        if (!acc[day]) acc[day] = [];
                        acc[day].push(dest);
                        return acc;
                      }, {})
                    ).map(([dayNum, dests]) => (
                      <div key={`day-${dayNum}`} className="bg-[#11212D] rounded-lg p-4">
                        <h5 className="text-xs font-bold text-[#00C896] mb-2 uppercase tracking-wide">
                          Day {String(dayNum).padStart(2, "0")}
                        </h5>
                        <div className="flex flex-col gap-2">
                          {dests.map((destination, index) => (
                            <div
                              key={destination.id || destination._id || `dest-${index}`}
                              className="text-sm text-gray-300 flex justify-between items-center bg-[#253745]/50 px-3 py-2 rounded"
                            >
                              <span>
                                {index + 1}. {destination.name}
                                {destination.location && ` (${destination.location})`}
                              </span>
                              {destination.timeSlot && (
                                <span className="text-gray-400 text-xs bg-[#253745] px-2 py-1 rounded border border-white/5">
                                  {destination.timeSlot}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bookings Section */}
                {(activeTour.selectedGuide ||
                  activeTour.selectedHotels?.length > 0 ||
                  activeTour.selectedTransport) && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                      Bookings
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeTour.selectedGuide && (
                        <div className="bg-[#11212D] rounded-lg p-3">
                          <span className="text-xs text-gray-400 block mb-0.5">Guide</span>
                          <p className="text-sm text-white font-medium">
                            {activeTour.selectedGuide.firstName} {activeTour.selectedGuide.lastName}
                          </p>
                        </div>
                      )}

                      {activeTour.selectedHotels?.map((hotel) => (
                        <div key={hotel._id} className="bg-[#11212D] rounded-lg p-3">
                          <span className="text-xs text-gray-400 block mb-0.5">Hotel</span>
                          <p className="text-sm text-white font-medium">
                            {hotel.hotelName} ({hotel.location})
                          </p>
                        </div>
                      ))}

                      {activeTour.selectedTransport && (
                        <div className="bg-[#11212D] rounded-lg p-3">
                          <span className="text-xs text-gray-400 block mb-0.5">Vehicle</span>
                          <p className="text-sm text-white font-medium">
                            {activeTour.selectedTransport.vehicleBrand} {activeTour.selectedTransport.vehicleModel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start New Trip Form Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 page-title-anim">
          Plan Your Own{" "}
          <span className="text-[#00C896]">Sri Lanka Trip</span>
        </h1>

        <p className="text-gray-300 text-lg mb-8 page-desc-anim">
          Pick the places you want to visit, and we'll auto-generate your trip
          route, show the distance between stops, and connect you with local
          guides, hotels, and transport in those areas.
        </p>

        <div className="tour-form-anim">
          <div className="max-w-sm mx-auto mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">
              You're starting your trip from...
            </label>

            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="w-full flex items-center gap-2 bg-[#253745] border border-[#3a4b58] rounded-md px-3 py-2 text-white hover:border-[#00C896] focus:outline-none focus:border-[#00C896] transition-colors cursor-pointer"
            >
              <MapPin size={16} className="text-[#00C896] flex-shrink-0" />
              <span
                className={
                  startLocation
                    ? "text-white text-sm truncate"
                    : "text-gray-400 text-sm truncate"
                }
              >
                {startLocation
                  ? startLocation.address
                  : "Pick your starting location on the map"}
              </span>
            </button>

            {startDistrict && (
              <p className="text-xs text-[#00C896] mt-2">
                Detected district: {startDistrict.value}
              </p>
            )}
          </div>
          
          <div className="max-w-sm mx-auto mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">
              Trip Start Date
            </label>
            <input
              type="date"
              min={getTodayString()}
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setError("");
              }}
              className="tour-date-input"
            />
          </div>

          <div className="max-w-sm mx-auto mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">
              Trip Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              placeholder="How many days do you plan to travel?"
              value={tripDuration}
              onChange={(event) => {
                setTripDuration(event.target.value);
                setError("");
              }}
              className="w-full bg-[#253745] border border-[#3a4b58] rounded-md px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#00C896]"
            />
          </div>

          <div className="max-w-sm mx-auto mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">
              Number of guests
            </label>
            <Select
              options={guestOptions}
              value={numberOfGuests}
              onChange={(option) => {
                setNumberOfGuests(option);
                setError("");
              }}
              placeholder="Select number of guests..."
              styles={selectStyles}
              menuShouldScrollIntoView={false}
              menuPortalTarget={document.body}
            />

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="bg-[#00C896] text-[#11212D] font-semibold px-8 py-3 rounded-full hover:opacity-90 transition"
          >
            Start Planning
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<MapPin className="mx-auto text-[#00C896] mb-3" size={32} />}
          title="1. Select Destinations"
          description="Choose as many places as you like, from beaches to ancient cities to wildlife parks."
          delay={0}
        />

        <FeatureCard
          icon={<Route className="mx-auto text-[#00C896] mb-3" size={32} />}
          title="2. Get Your Route"
          description="We map out the trip order and show the distance between each stop."
          delay={0.15}
        />

        <FeatureCard
          icon={<Users className="mx-auto text-[#00C896] mb-3" size={32} />}
          title="3. Book Locally"
          description="See guides, hotels, and transport available near each destination."
          delay={0.3}
        />
      </div>

      <div className="mt-16">
        <Footer />
      </div>

      {showMapPicker && (
        <MapPickerModal
          initialPosition={
            startLocation
              ? {
                  lat: startLocation.lat,
                  lng: startLocation.lng,
                }
              : undefined
          }
          onClose={() => setShowMapPicker(false)}
          onConfirm={handleMapConfirm}
          title="Pick your starting location"
        />
      )}
    </div>
  );
};

export default TourPage;