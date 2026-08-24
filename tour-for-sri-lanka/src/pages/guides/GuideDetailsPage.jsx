import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaLanguage,
  FaClock,
  FaUserFriends,
  FaMountain,
  FaHiking,
  FaPaw,
  FaWater,
  FaUtensils,
  FaCamera,
  FaLandmark,
  FaScroll,
  FaBuilding,
  FaTree,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GuideReviews from "./GuideReviews";
import Booking from "./Booking";

const skillMeta = {
  CulturalTours: { icon: <FaLandmark />, label: "Cultural Tours" },
  AdventureTours: { icon: <FaMountain />, label: "Adventure Tours" },
  WildLifeTours: { icon: <FaPaw />, label: "Wild Life Tours" },
  Hiking: { icon: <FaHiking />, label: "Hiking" },
  SurfingGuide: { icon: <FaWater />, label: "Surfing Guide" },
  FoodTours: { icon: <FaUtensils />, label: "Food Tours" },
  PhotographyTours: { icon: <FaCamera />, label: "Photography Tours" },
  HistoricalTours: { icon: <FaScroll />, label: "Historical Tours" },
  CityTours: { icon: <FaBuilding />, label: "City Tours" },
  NatureGuide: { icon: <FaTree />, label: "Nature Guide" },
};

const languageLabels = {
  english: "English",
  sinhala: "Sinhala",
  tamil: "Tamil",
  spanish: "Spanish",
  japan: "Japanese",
  chaina: "Chinese",
  korean: "Korean",
};

const API_BASE = `${API_BASE_URL}/api`;

export default function GuideDetailsPage() {
  const { id } = useParams();

  const [guide, setGuide] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    async function loadGuide() {
      try {
        const res = await fetch(`${API_BASE}/guide/${id}`);
        const data = await res.json();
        setGuide(data);
      } catch (err) {
        console.log(err);
        toast.error("Can't load guide details");
      } finally {
        setLoading(false);
      }
    }

    async function loadMyBookings() {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/guidebooking/my/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMyBookings(data);
        }
      } catch (err) {
        console.log(err);
      }
    }

    loadGuide();
    loadMyBookings();
  }, [id]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/guidereview/guide/${id}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.log(err);
        toast.error("Can't load reviews");
      }
    }

    loadReviews();
  }, [id]);

  function handleReviewAdded(savedReview, isUpdate) {
    if (isUpdate) {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === savedReview._id ? savedReview : r
        )
      );
    } else {
      setReviews((prev) => [savedReview, ...prev]);
    }
  }

  function handleReviewDeleted(reviewId) {
    setReviews((prev) =>
      prev.filter((r) => r._id !== reviewId)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Loading...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Guide not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2530] pt-24 sm:pt-28">
      <Navbar />

      {/* Hero */}
      <div className="guide-hero-anim relative h-[300px] sm:h-[360px] lg:h-[420px] px-3 sm:px-4">
        <div className="relative h-full rounded-[20px] sm:rounded-[30px] overflow-hidden">
          <img
            src={guide.profilePic || "/guide_placeholder.jpg"}
            alt={`${guide.firstName} ${guide.lastName}`}
            className="w-full h-full object-cover object-[center_20%]"
          />

          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-3 sm:px-5 -mt-[40px] sm:-mt-[60px] relative z-10">

        {/* Guide Information */}
        <div className="guide-info-anim bg-[#253745] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-bold text-[22px] sm:text-[26px] break-words">
                  {guide.firstName} {guide.lastName}
                </h1>

                <FaCheckCircle
                  className="text-[#00C896] text-[17px] shrink-0"
                  title="Licensed Guide"
                />
              </div>

              <div className="flex items-start gap-2 mt-2 text-gray-400 text-[13px] sm:text-[14px]">
                <FaMapMarkerAlt className="text-[#00C896] mt-0.5 shrink-0" />
                <span>
                  {guide.district}, {guide.province}
                </span>
              </div>

              <div className="flex items-start gap-2 mt-2 text-gray-400 text-[13px] sm:text-[14px]">
                <FaClock className="text-[#00C896] mt-0.5 shrink-0" />
                <span>
                  {guide.yearsOfExperience}+ years experience
                </span>
              </div>
            </div>

            <span className="self-start text-[11px] sm:text-[12px] text-[#00C896] bg-[#00C896]/10 px-3 py-1 rounded-full break-all">
              License #{guide.GuideLicenseNumber}
            </span>
          </div>

          <p className="text-gray-300 text-[13px] sm:text-[14px] mt-4 leading-relaxed">
            {guide.aboutYourSelf}
          </p>
        </div>

        {/* Languages */}
        <div className="guide-languages-anim mt-7 sm:mt-8">
          <h2 className="text-white font-bold text-[18px] sm:text-[20px] mb-4">
            Languages
          </h2>

          <div className="flex flex-wrap gap-2">
            {Object.entries(languageLabels)
              .filter(([key]) => guide.languages?.[key])
              .map(([key, label]) => (
                <div
                  key={key}
                  className="bg-[#253745] rounded-[12px] sm:rounded-[14px] px-3 sm:px-4 py-2 flex items-center gap-2"
                >
                  <FaLanguage className="text-[#00C896] text-[13px] sm:text-[14px]" />

                  <span className="text-gray-300 text-[11px] sm:text-[12px]">
                    {label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Skills */}
        <div className="guide-skills-anim mt-7 sm:mt-8">
          <h2 className="text-white font-bold text-[18px] sm:text-[20px] mb-4">
            Tour Specialties
          </h2>

          <div className="flex flex-wrap gap-2">
            {Object.entries(skillMeta)
              .filter(([key]) => guide.skill?.[key])
              .map(([key, meta]) => (
                <div
                  key={key}
                  className="bg-[#253745] rounded-[12px] sm:rounded-[14px] px-3 sm:px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-[#00C896] text-[13px] sm:text-[14px]">
                    {meta.icon}
                  </span>

                  <span className="text-gray-300 text-[11px] sm:text-[12px]">
                    {meta.label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Price */}
        <div className="guide-price-anim mt-8 sm:mt-10 bg-[#253745] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8">

              <div>
                <p className="text-[#00C896] font-bold text-[18px] sm:text-[20px]">
                  {guide.currency} {guide.pricePerHour}
                </p>

                <p className="text-gray-500 text-[11px] sm:text-[12px]">
                  per hour
                </p>
              </div>

              <div>
                <p className="text-[#00C896] font-bold text-[18px] sm:text-[20px]">
                  {guide.currency} {guide.pricePerDay}
                </p>

                <p className="text-gray-500 text-[11px] sm:text-[12px]">
                  per day
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-gray-400 text-[13px] sm:text-[14px]">
                <FaUserFriends className="text-[#00C896] shrink-0" />
                <span>
                  Up to {guide.maximumGuests} guests
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full lg:w-auto bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-6 sm:px-7 py-3 rounded-full font-semibold text-sm sm:text-base"
            >
              Book This Guide
            </button>
          </div>
        </div>

        {/* My Bookings */}
        {myBookings.length > 0 && (
          <div className="guide-mybookings-anim mt-5 bg-[#253745] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
            <h3 className="text-white font-bold text-[16px] mb-3">
              Your Bookings
            </h3>

            <div className="flex flex-col gap-2">
              {myBookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-[#1a2530] rounded-[12px] px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <p className="text-gray-300 text-[12px] sm:text-[13px]">
                    {new Date(b.date).toLocaleDateString()} ·{" "}
                    {b.durationType === "hourly"
                      ? `${b.quantity} hrs`
                      : `${b.quantity} days`}{" "}
                    · {b.numberOfGuests} guests
                  </p>

                  <span
                    className={`self-start sm:self-auto text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full ${
                      b.status === "confirmed"
                        ? "bg-[#00C896]/20 text-[#00C896]"
                        : b.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="guide-reviews-anim">
          <GuideReviews
            guideId={guide._id}
            reviews={reviews}
            onReviewAdded={handleReviewAdded}
            onReviewDeleted={handleReviewDeleted}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <Booking
          guide={guide}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(newBooking) =>
            setMyBookings((prev) => [newBooking, ...prev])
          }
        />
      )}

      <div className="mt-12 sm:mt-[60px]">
        <Footer />
      </div>
    </div>
  );
}