import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { MapPin, Route, Users, Compass, X, Download } from "lucide-react";
import toast from "react-hot-toast";
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

// Draws a simple, branded "route map" diagram directly on the PDF using each
// destination's lat/lng — numbered stops connected in visiting order, with a
// dashed return leg back to the first stop (matching the same visual language
// used on the live trip map). No external tile images are used, so this never
// depends on network access, CORS, or load timing when the PDF is generated.
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
    // Flip latitude so north stays toward the top of the box
    const py = boxY + padding + (1 - (lat - minLat) / latSpan) * innerHeight;
    return [px, py];
  };

  // Panel background
  doc.setFillColor(37, 55, 69); // #253745
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "F");

  const coords = points.map((point) => project(point.lat, point.lng));

  // Solid lines in visiting order
  doc.setDrawColor(0, 200, 150); // #00C896
  doc.setLineWidth(0.7);
  doc.setLineDashPattern([], 0);

  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
  }

  // Dashed return leg back to the start
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(
    coords[coords.length - 1][0],
    coords[coords.length - 1][1],
    coords[0][0],
    coords[0][1]
  );
  doc.setLineDashPattern([], 0);

  // Numbered markers + short labels
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

    return saved
      ? {
          value: saved,
          label: saved,
        }
      : null;
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
  const [showTourModal, setShowTourModal] = useState(false);

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
      sessionStorage.setItem(
        "tourNumberOfGuests",
        String(numberOfGuests.value)
      );
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
    const saved = localStorage.getItem("activeTourSummary");

    if (!saved) return;

    try {
      setActiveTour(JSON.parse(saved));
    } catch {
      localStorage.removeItem("activeTourSummary");
    }
  }, []);

  const handleMapConfirm = (location) => {
    setStartLocation(location);

    const matchedDistrict = districtOptions.find((district) =>
      location.address
        ?.toLowerCase()
        .includes(district.value.toLowerCase())
    );

    if (matchedDistrict) {
      setStartDistrict(matchedDistrict);
    }

    setError("");
    setShowMapPicker(false);
  };

  const handleClearTour = () => {
    localStorage.removeItem("activeTourSummary");
    setActiveTour(null);
    setShowTourModal(false);
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

    const tripReference = `TSL-${
      activeTour._id || activeTour.tourId || Date.now()
    }`
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
    doc.text("Your Trip Summary & Budget Estimate", 14, 23);

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

    // Trip overview panel — the "who / when / how many" a receipt needs
    // up front, before the itemised bookings below.
    const overviewHeight = 30;

    doc.setFillColor(37, 55, 69); // #253745
    doc.roundedRect(14, y, pageWidth - 28, overviewHeight, 3, 3, "F");

    const overviewRows = [
      ["Starting Point", activeTour.startAddress || "-"],
      [
        "Trip Start Date",
        activeTour.tripStartDate ? formatDate(activeTour.tripStartDate) : "-",
      ],
      [
        "Duration",
        activeTour.tripDuration ? `${activeTour.tripDuration} day(s)` : "-",
      ],
      [
        "Guests",
        activeTour.numberOfGuests ? `${activeTour.numberOfGuests}` : "-",
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

    const routeRows = (activeTour.destinations || []).map((destination, index) => [
      `${index + 1}`,
      destination.name || "-",
      destination.location || "-",
    ]);

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

    // Route map — a schematic diagram of the stops in visiting order.
    const hasRouteCoords =
      (activeTour.destinations || []).filter(
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
      drawRouteDiagram(doc, 14, y + 2, pageWidth - 28, mapHeight, activeTour.destinations);

      y += mapHeight + 12;
    }

    if (activeTour.guideBookings?.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("Guide Bookings", 14, y);

      const guideRows = activeTour.guideBookings.map((guide) => [
        guide.displayName || "-",
        formatDate(guide.date),
        `${guide.quantity} ${
          guide.durationType === "hourly" ? "hr(s)" : "day(s)"
        }`,
        `${guide.numberOfGuests}`,
        `${guide.currency || "LKR"} ${Number(
          guide.totalPrice || 0
        ).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: y + 4,
        head: [["Guide", "Date", "Duration", "Guests", "Price"]],
        body: guideRows,
        theme: "striped",
        headStyles: {
          fillColor: accent,
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 4,
        },
        margin: {
          left: 14,
          right: 14,
        },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    if (activeTour.hotelBookings?.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("Hotel Bookings", 14, y);

      const hotelRows = activeTour.hotelBookings.map((hotel) => [
        hotel.displayName || "-",
        formatDate(hotel.checkInDate),
        formatDate(hotel.checkOutDate),
        `${hotel.numberOfGuests}`,
        `LKR ${Number(hotel.totalPrice || 0).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: y + 4,
        head: [["Hotel / Room", "Check-in", "Check-out", "Guests", "Price"]],
        body: hotelRows,
        theme: "striped",
        headStyles: {
          fillColor: accent,
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 4,
        },
        margin: {
          left: 14,
          right: 14,
        },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    if (activeTour.transportBookings?.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("Transport Bookings", 14, y);

      const transportRows = activeTour.transportBookings.map((transport) => [
        transport.displayName || "-",
        formatDate(transport.pickupDate),
        formatDate(transport.returnDate),
        `${transport.numberOfGuests}`,
        `LKR ${Number(transport.totalPrice || 0).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: y + 4,
        head: [["Vehicle", "Pickup", "Return", "Passengers", "Price"]],
        body: transportRows,
        theme: "striped",
        headStyles: {
          fillColor: accent,
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9.5,
          cellPadding: 4,
        },
        margin: {
          left: 14,
          right: 14,
        },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...dark);
    doc.roundedRect(14, y, pageWidth - 28, 44, 3, 3, "F");

    doc.setTextColor(230, 230, 230);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("Guides", 20, y + 10);
    doc.text(
      `LKR ${Number(activeTour.guideBudget || 0).toLocaleString()}`,
      pageWidth - 20,
      y + 10,
      { align: "right" }
    );

    doc.text("Hotels", 20, y + 18);
    doc.text(
      `LKR ${Number(activeTour.hotelBudget || 0).toLocaleString()}`,
      pageWidth - 20,
      y + 18,
      { align: "right" }
    );

    doc.text("Transport", 20, y + 26);
    doc.text(
      `LKR ${Number(activeTour.transportBudget || 0).toLocaleString()}`,
      pageWidth - 20,
      y + 26,
      { align: "right" }
    );

    doc.setDrawColor(90, 100, 110);
    doc.line(20, y + 30, pageWidth - 20, y + 30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Total Estimated Budget", 20, y + 39);

    doc.setTextColor(...accent);
    doc.text(
      `LKR ${Number(activeTour.totalBudget || 0).toLocaleString()}`,
      pageWidth - 20,
      y + 39,
      { align: "right" }
    );

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

  return (
    <div className="min-h-screen bg-[#11212D] text-white pt-28">
      <Navbar />

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
              <MapPin
                size={16}
                className="text-[#00C896] flex-shrink-0"
              />

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
                  className="block w-full min-w-0 max-w-full h-[42px] bg-[#253745] border border-[#3A4B58] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#00C896]"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
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

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
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
          icon={
            <MapPin
              className="mx-auto text-[#00C896] mb-3"
              size={32}
            />
          }
          title="1. Select Destinations"
          description="Choose as many places as you like, from beaches to ancient cities to wildlife parks."
          delay={0}
        />

        <FeatureCard
          icon={
            <Route
              className="mx-auto text-[#00C896] mb-3"
              size={32}
            />
          }
          title="2. Get Your Route"
          description="We map out the trip order and show the distance between each stop."
          delay={0.15}
        />

        <FeatureCard
          icon={
            <Users
              className="mx-auto text-[#00C896] mb-3"
              size={32}
            />
          }
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

      {activeTour && (
        <button
          type="button"
          onClick={() => setShowTourModal(true)}
          className="fixed right-5 top-1/2 -translate-y-1/2 z-50 w-16 h-16 rounded-full bg-[#00C896] text-[#11212D] flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Your Tour"
        >
          <Compass size={22} />

          <span className="text-[9px] font-semibold mt-0.5">
            Your Tour
          </span>
        </button>
      )}

      {showTourModal && activeTour && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] px-4"
          onClick={() => setShowTourModal(false)}
        >
          <div
            className="bg-[#1B2B34] rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#00C896]">
                Your Booked Tour
              </h3>

              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-2 border-b border-white/10 pb-1">
                Trip Route
              </h4>

              <div className="flex flex-col gap-1.5 mt-2">
                {activeTour.destinations?.map((destination, index) => (
                  <div
                    key={destination.id || `dest-${index}`}
                    className="text-sm text-gray-300"
                  >
                    {index + 1}. {destination.name}{" "}
                    {destination.location &&
                      `(${destination.location})`}
                  </div>
                ))}
              </div>
            </div>

            {activeTour.guideBookings?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-white mb-2 border-b border-white/10 pb-1">
                  Guide Bookings
                </h4>

                <div className="flex flex-col gap-2 mt-2">
                  {activeTour.guideBookings.map((guide) => (
                    <div
                      key={guide.cartId}
                      className="bg-[#253745] rounded-lg px-3 py-2"
                    >
                      <p className="text-sm text-white">
                        {guide.displayName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(guide.date)} · {guide.quantity} day(s) ·{" "}
                        {guide.numberOfGuests} guest(s)
                      </p>

                      <p className="text-xs text-[#00C896] font-semibold mt-1">
                        {guide.currency}{" "}
                        {Number(guide.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTour.hotelBookings?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-white mb-2 border-b border-white/10 pb-1">
                  Hotel Bookings
                </h4>

                <div className="flex flex-col gap-2 mt-2">
                  {activeTour.hotelBookings.map((hotel) => (
                    <div
                      key={hotel.cartId}
                      className="bg-[#253745] rounded-lg px-3 py-2"
                    >
                      <p className="text-sm text-white">
                        {hotel.displayName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(hotel.checkInDate)} →{" "}
                        {formatDate(hotel.checkOutDate)} ·{" "}
                        {hotel.numberOfGuests} guest(s)
                      </p>

                      <p className="text-xs text-[#00C896] font-semibold mt-1">
                        LKR{" "}
                        {Number(hotel.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTour.transportBookings?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-white mb-2 border-b border-white/10 pb-1">
                  Transport Bookings
                </h4>

                <div className="flex flex-col gap-2 mt-2">
                  {activeTour.transportBookings.map((transport) => (
                    <div
                      key={transport.cartId}
                      className="bg-[#253745] rounded-lg px-3 py-2"
                    >
                      <p className="text-sm text-white">
                        {transport.displayName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(transport.pickupDate)} →{" "}
                        {formatDate(transport.returnDate)} ·{" "}
                        {transport.numberOfGuests} pax
                      </p>

                      <p className="text-xs text-[#00C896] font-semibold mt-1">
                        LKR{" "}
                        {Number(
                          transport.totalPrice || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#11212D] rounded-lg p-4 mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Guides</span>

                <span>
                  LKR{" "}
                  {Number(
                    activeTour.guideBudget || 0
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Hotels</span>

                <span>
                  LKR{" "}
                  {Number(
                    activeTour.hotelBudget || 0
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Transport</span>

                <span>
                  LKR{" "}
                  {Number(
                    activeTour.transportBudget || 0
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                <span className="text-sm font-semibold text-white">
                  Total Budget
                </span>

                <span className="text-lg font-bold text-[#00C896]">
                  LKR{" "}
                  {Number(
                    activeTour.totalBudget || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#00C896] text-[#11212D] font-semibold text-sm py-2.5 rounded-md hover:bg-[#00b386] transition-colors"
            >
              <Download size={14} />
              Download as PDF
            </button>

            <button
              type="button"
              onClick={handleClearTour}
              className="w-full mt-2 flex items-center justify-center gap-2 border border-red-400/40 text-red-400 text-sm py-2 rounded-md hover:bg-red-400/10 transition-colors"
            >
              <X size={14} />
              Clear this tour from view
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPage;