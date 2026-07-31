import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt, FaCheckCircle, FaLanguage, FaClock, FaUserFriends,
  FaMountain, FaHiking, FaPaw, FaWater, FaUtensils, FaCamera,
  FaLandmark, FaScroll, FaBuilding, FaTree
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
  NatureGuide: { icon: <FaTree />, label: "Nature Guide" }
}

const languageLabels = {
  english: "English", sinhala: "Sinhala", tamil: "Tamil", spanish: "Spanish",
  japan: "Japanese", chaina: "Chinese", korean: "Korean"
}

const dayLabels = {
  monday: "Mon", tuesday: "Tue", wednsday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun"
}

const API_BASE = "http://localhost:3000/api"

export default function GuideDetailsPage(){
  const { id } = useParams()
  const [guide, setGuide] = useState(null)
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    async function loadMyBookings(){
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        if(!token) return

        try{
            const res = await fetch(`${API_BASE}/guidebooking/my/${id}`,{
                headers: {"Authorization": `Bearer ${token}`}
            })
            if(res.ok){
                const data = await res.json()
                setMyBookings(data)
            }
        }catch(err){
            console.log(err)
        }
    }
    loadMyBookings()
    async function loadGuide(){
      try{
        const res = await fetch(`${API_BASE}/guide/${id}`)
        const data = await res.json()
        setGuide(data)
      }catch(err){
        toast.error("Can't load guide details")
      }finally{
        setLoading(false)
      }
    }
    loadGuide()
  }, [id])

  useEffect(() => {
    async function loadReviews(){
      try{
        const res = await fetch(`${API_BASE}/guidereview/guide/${id}`)
        const data = await res.json()
        setReviews(data)
      }catch(err){
        toast.error("Can't load reviews")
      }
    }
    loadReviews()
  }, [id])

  function handleReviewAdded(savedReview, isUpdate){
    if(isUpdate){
      setReviews((prev) => prev.map((r) => (r._id === savedReview._id ? savedReview : r)))
    }else{
      setReviews((prev) => [savedReview, ...prev])
    }
  }

  function handleReviewDeleted(reviewId){
    setReviews((prev) => prev.filter((r) => r._id !== reviewId))
  }

  if(loading){
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Loading...</p>
      </div>
    )
  }

  if(!guide){
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Guide not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a2530] pt-28">
      <Navbar/>

      <div className="relative h-[420px] px-4">
        <div className="relative h-full rounded-[30px] overflow-hidden">
          <img
            src={guide.profilePic || "/guide_placeholder.jpg"}
            alt={`${guide.firstName} ${guide.lastName}`}
            className="w-full h-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-[20px] -mt-[60px] relative z-10">

        <div className="bg-[#253745] rounded-[20px] p-[24px] shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-[12px]">
            <div>
              <div className="flex items-center gap-[10px]">
                <h1 className="text-white font-bold text-[26px]">
                  {guide.firstName} {guide.lastName}
                </h1>
                <FaCheckCircle className="text-[#00C896] text-[18px]" title="Licensed Guide" />
              </div>
              <div className="flex items-center gap-1 mt-[8px] text-gray-400 text-[14px]">
                <FaMapMarkerAlt className="text-[#00C896]" />
                <span>{guide.district}, {guide.province}</span>
              </div>
              <div className="flex items-center gap-1 mt-[6px] text-gray-400 text-[14px]">
                <FaClock className="text-[#00C896]" />
                <span>{guide.yearsOfExperience}+ years experience</span>
              </div>
            </div>

            <span className="text-[12px] text-[#00C896] bg-[#00C896]/10 px-[12px] py-[4px] rounded-full">
              License #{guide.GuideLicenseNumber}
            </span>
          </div>

          <p className="text-gray-300 text-[14px] mt-[16px] leading-relaxed">
            {guide.aboutYourSelf}
          </p>
        </div>

        <div className="mt-[30px]">
          <h2 className="text-white font-bold text-[20px] mb-[16px]">Languages</h2>
          <div className="flex flex-wrap gap-[10px]">
            {Object.entries(languageLabels)
              .filter(([key]) => guide.languages?.[key])
              .map(([key, label]) => (
                <div key={key} className="bg-[#253745] rounded-[14px] px-[14px] py-[8px] flex items-center gap-[8px]">
                  <FaLanguage className="text-[#00C896] text-[14px]" />
                  <span className="text-gray-300 text-[12px]">{label}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-[30px]">
          <h2 className="text-white font-bold text-[20px] mb-[16px]">Tour Specialties</h2>
          <div className="flex flex-wrap gap-[10px]">
            {Object.entries(skillMeta)
              .filter(([key]) => guide.skill?.[key])
              .map(([key, meta]) => (
                <div key={key} className="bg-[#253745] rounded-[14px] px-[14px] py-[8px] flex items-center gap-[8px]">
                  <span className="text-[#00C896] text-[14px]">{meta.icon}</span>
                  <span className="text-gray-300 text-[12px]">{meta.label}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-[40px] bg-[#253745] rounded-[20px] p-[24px] flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex gap-[32px]">
            <div>
              <p className="text-[#00C896] font-bold text-[20px]">{guide.currency} {guide.pricePerHour}</p>
              <p className="text-gray-500 text-[12px]">per hour</p>
            </div>
            <div>
              <p className="text-[#00C896] font-bold text-[20px]">{guide.currency} {guide.pricePerDay}</p>
              <p className="text-gray-500 text-[12px]">per day</p>
            </div>
            <div className="flex items-center gap-[6px] text-gray-400 text-[14px]">
              <FaUserFriends className="text-[#00C896]" />
              <span>Up to {guide.maximumGuests} guests</span>
            </div>
          </div>

          <button 
            onClick={() => setShowBookingModal(true)}
            className="bg-[#00C896] hover:bg-[#00b383] duration-300 text-white px-[28px] py-[12px] rounded-full font-semibold">
                Book This Guide
          </button>
        </div>
        {myBookings.length > 0 && (
          <div className="mt-[20px] bg-[#253745] rounded-[20px] p-[24px]">
            <h3 className="text-white font-bold text-[16px] mb-[12px]">Your Bookings</h3>
            <div className="flex flex-col gap-[10px]">
              {myBookings.map((b) => (
                <div key={b._id} className="bg-[#1a2530] rounded-[12px] px-[16px] py-[10px] flex items-center justify-between">
                  <p className="text-gray-300 text-[13px]">
                    {new Date(b.date).toLocaleDateString()} · {b.durationType === "hourly" ? `${b.quantity} hrs` : `${b.quantity} days`} · {b.numberOfGuests} guests
                  </p>
                  <span className={`text-[11px] px-[10px] py-[3px] rounded-full ${
                    b.status === "confirmed" ? "bg-[#00C896]/20 text-[#00C896]" :
                    b.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <GuideReviews
          guideId={guide._id}
          reviews={reviews}
          onReviewAdded={handleReviewAdded}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>
      {showBookingModal && (
        <Booking 
            guide={guide} 
            onClose={() => setShowBookingModal(false)}
            onSuccess={(newBooking) => setMyBookings((prev) => [newBooking, ...prev])}
        />
      )}

      <div className="mt-[60px]">
        <Footer/>
      </div>
    </div>
  )
}
