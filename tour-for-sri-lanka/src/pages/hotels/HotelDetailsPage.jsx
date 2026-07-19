import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt, FaWifi, FaSwimmingPool, FaParking, FaSnowflake,
  FaSpa, FaDog, FaDumbbell, FaGlassMartiniAlt, FaTv, FaBath,
  FaStar, FaUserFriends, FaBed, FaTimes, FaCheckCircle,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

const facilityMeta = {
  wifi: { icon: <FaWifi />, label: "Free WiFi" },
  parking: { icon: <FaParking />, label: "Parking" },
  pool: { icon: <FaSwimmingPool />, label: "Swimming Pool" },
  ac: { icon: <FaSnowflake />, label: "Air Conditioning" },
  spa: { icon: <FaSpa />, label: "Spa" },
  allowsPets: { icon: <FaDog />, label: "Pet Friendly" },
  gym: { icon: <FaDumbbell />, label: "Gym" },
  bar: { icon: <FaGlassMartiniAlt />, label: "Bar" },
  tv: { icon: <FaTv />, label: "TV" },
  hotWater: { icon: <FaBath />, label: "Hot Water" }
}

const roomFacilityLabels = {
  wifi: "WiFi", ac: "AC", tv: "TV", bar: "Bar", balcony: "Balcony",
  hotWater: "Hot Water", pool: "Pool", spa: "Spa", breakfast: "Breakfast",
  lunch: "Lunch", gym: "Gym"
}

const API_BASE = "http://localhost:3000/api"

export default function HotelDetailsPage(){
  const { id } = useParams()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const[prevImage, setPrevImage] = useState(0)
  const [fade, setFade] = useState(false)

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadHotel(){
      try{
        const res = await fetch(`${API_BASE}/hotel/${id}`)
        const data = await res.json()
        setHotel(data)
      }catch(err){
        toast.error("Can't load hotel details")
      }
    }

    async function loadRooms(){
      try{
        const res = await fetch(`${API_BASE}/addRoom/hotel/${id}`)
        const data = await res.json()
        setRooms(Array.isArray(data) ? data : [])
      }catch(err){
        setRooms([])
      }
    }

    async function loadReviews(){
      try{
        const res = await fetch(`${API_BASE}/review/hotel/${id}`)
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      }catch(err){
        setReviews([])
      }
    }

    Promise.all([loadHotel(), loadRooms(), loadReviews()]).then(() => setLoading(false))
  }, [id])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  let imagesArray = []
  try{
    imagesArray = typeof hotel?.images === "string" ? JSON.parse(hotel.images) : hotel?.images || []
  }catch(err){
    imagesArray = []
  }
  if(imagesArray.length === 0) imagesArray = ["/hotel_placeholder.jpg"]

  useEffect(() => {
    if(imagesArray.length <= 1) return

    const interval = setInterval(() => {
        setActiveImage((prev) => (prev === imagesArray.length - 1 ? 0 : prev + 1))
    },5000)
    return () => clearInterval(interval)
  }, [imagesArray.length])

  async function submitBooking(){
    if(!checkIn || !checkOut){
      toast.error("Fill Check-in and Check-out dates")
      return
    }
    setBooking(true)
    try{
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hotelId: id,
          roomId: selectedRoom._id,
          checkIn,
          checkOut,
          guests
        })
      })
      if(!res.ok) throw new Error("failed")
      toast.success("Booking request sent")
      setSelectedRoom(null)
      setCheckIn("")
      setCheckOut("")
      setGuests(1)
    }catch(err){
      toast.error("Booking submit failed")
    }finally{
      setBooking(false)
    }
  }

  async function submitReview(){
    if(!reviewComment.trim()){
      toast.error("Failed to submit a review")
      return
    }
    setSubmittingReview(true)
    try{
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hotelId: id,
          rating: reviewRating,
          comment: reviewComment
        })
      })
      if(!res.ok) throw new Error("failed")
      const newReview = await res.json()
      setReviews([newReview, ...reviews])
      setReviewComment("")
      setReviewRating(5)
      toast.success("Review added successfully")
    }catch(err){
      toast.error("Review submited failed")
    }finally{
      setSubmittingReview(false)
    }
  }

  if(loading){
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Loading...</p>
      </div>
    )
  }

  if(!hotel){
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center">
        <p className="text-white text-[16px]">Hotel not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a2530] pt-28 pb-[60px]">
        <Navbar/>
        {/* Hero image gallery */}
        <div className="relative h-[420px] px-4">
            <div className="relative h-full rounded-[30px] overflow-hidden group">
                {imagesArray.map((img, i) => (
                    <img
                        key={1}
                        src={img}
                        alt={hotel.hotelName}
                        className={`absolute inset-0 w-full h-full object-cover object-[center_70%] transition-opacity duration-1000 ease-in-out ${
                            i === activeImage ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}
                
        {imagesArray.length > 1 && (
            <>
                <button
                    onClick={()=>
                        setActiveImage((prev) => (prev === 0 ? imagesArray.length - 1 : prev - 1))
                    }
                    className="absolute left-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 hover:text-[#00C896]/80 text-white h-[40px] w-[40px] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <FaChevronLeft/>
                </button>

                <button
                    onClick={() => 
                        setActiveImage((prev) => (prev === imagesArray.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60  hover:text-[#00C896]/80 text-white w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <FaChevronRight/>
                </button>
            </>
                
        )}
        </div>
    </div>

      <div className="max-w-[1100px] mx-auto px-[20px] -mt-[60px] relative z-10">

        {/* Hotel header card */}
        <div className="bg-[#253745] rounded-[20px] p-[24px] shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-[12px]">
            <div>
              <div className="flex items-center gap-[10px]">
                <h1 className="text-white font-bold text-[26px]">{hotel.hotelName}</h1>
                {hotel.isApproved && (
                  <FaCheckCircle className="text-[#00C896] text-[18px]" title="Verified Hotel" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-[8px] text-gray-400 text-[14px]">
                <FaMapMarkerAlt className="text-[#00C896]" />
                <span>{hotel.location}, {hotel.district}, {hotel.province}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-[6px]">
              <span className="text-[12px] text-[#00C896] bg-[#00C896]/10 px-[12px] py-[4px] rounded-full">
                {hotel.hotelType}
              </span>
              {avgRating && (
                <div className="flex items-center gap-1 text-white text-[14px]">
                  <FaStar className="text-yellow-400" />
                  <span>{avgRating}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-300 text-[14px] mt-[16px] leading-relaxed">
            {hotel.shortDescription}
          </p>
        </div>

        {/* Facilities */}
        <div className="mt-[30px]">
          <h2 className="text-white font-bold text-[20px] mb-[16px]">Facilities</h2>
          <div className="flex flex-wrap gap-[10px]">
            {Object.entries(facilityMeta)
              .filter(([key]) => hotel.facilities?.[key])
              .map(([key, meta]) => (
                <div key={key} className="bg-[#253745] rounded-[14px] px-[14px] py-[8px] flex items-center gap-[8px] text-center">
                  <span className="text-[#00C896] text-[14px]">{meta.icon}</span>
                  <span className="text-gray-300 text-[12px]">{meta.label}</span>
                </div>
              ))}
            {hotel.otherFacility?.map((f, i) => (
              <div key={`other-${i}`} className="bg-[#253745] rounded-full px-[14px] py-[8px] flex items-center gap-[6px] text-center">
                <span className="text-[#00C896] text-[20px]"><FaCheckCircle /></span>
                <span className="text-gray-300 text-[12px]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rooms */}
        <div className="mt-[40px]">
          <h2 className="text-white font-bold text-[20px] mb-[16px]">Available Rooms</h2>

          {rooms.length === 0 ? (
            <p className="text-gray-400 text-[14px]">No rooms have been added for this hotel yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
              {rooms.map((room) => (
                <div key={room._id} className="bg-[#253745] rounded-[18px] overflow-hidden">
                  <div className="w-full h-[160px]">
                    <img src={room.image || "/room_placeholder.jpg"} alt={room.roomType} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-[16px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-[15px]">{room.roomType}</h3>
                      <span className="text-gray-400 text-[12px]">#{room.roomNumber}</span>
                    </div>

                    <div className="flex items-center gap-[14px] mt-[8px] text-gray-400 text-[12px]">
                      <span className="flex items-center gap-1"><FaUserFriends /> {room.capacity}</span>
                      <span className="flex items-center gap-1"><FaBed /> {room.roomType}</span>
                    </div>

                    <p className="text-gray-400 text-[12px] mt-[8px] line-clamp-2">{room.shortDescription}</p>

                    <div className="flex flex-wrap gap-[6px] mt-[10px]">
                      {Object.entries(roomFacilityLabels)
                        .filter(([key]) => room.roomFacility?.[key])
                        .map(([key, label]) => (
                          <span key={key} className="text-[10px] text-gray-300 bg-[#1a2530] px-[8px] py-[3px] rounded-full">
                            {label}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-[14px]">
                      <div>
                        <p className="text-[#00C896] font-bold text-[16px]">Rs. {room.pricePerNight}</p>
                        <p className="text-gray-500 text-[11px]">per night</p>
                      </div>
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="border border-[#00C896] text-[#00C896] px-[16px] py-[8px] rounded-full text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-[40px]">
          <h2 className="text-white font-bold text-[20px] mb-[16px]">Reviews</h2>

          <div className="bg-[#253745] rounded-[18px] p-[20px] mb-[20px]">
            <p className="text-gray-300 text-[13px] mb-[10px]">Write a review</p>
            <div className="flex gap-[6px] mb-[10px]">
              {[1,2,3,4,5].map((n) => (
                <FaStar
                  key={n}
                  onClick={() => setReviewRating(n)}
                  className={`cursor-pointer text-[18px] ${n <= reviewRating ? "text-yellow-400" : "text-gray-600"}`}
                />
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share Your Experience"
              className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[12px] outline-none resize-none"
              rows={3}
            />
            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="mt-[10px] bg-[#00C896] text-white px-[18px] py-[8px] rounded-full text-[13px] disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-[14px]">No any reviews</p>
          ) : (
            <div className="space-y-[12px]">
              {reviews.map((r, i) => (
                <div key={r._id || i} className="bg-[#253745] rounded-[14px] p-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-[14px] font-medium">{r.userName || "Traveler"}</span>
                    <div className="flex gap-[2px]">
                      {[1,2,3,4,5].map((n) => (
                        <FaStar key={n} className={`text-[12px] ${n <= r.rating ? "text-yellow-400" : "text-gray-600"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-[13px] mt-[8px]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-[16px]">
          <div className="bg-[#253745] rounded-[20px] p-[24px] w-full max-w-[420px] relative">
            <button onClick={() => setSelectedRoom(null)} className="absolute top-[16px] right-[16px] text-gray-400 hover:text-white">
              <FaTimes />
            </button>

            <h3 className="text-white font-bold text-[18px]">Book {selectedRoom.roomType}</h3>
            <p className="text-gray-400 text-[12px] mt-[4px]">Room #{selectedRoom.roomNumber} · Rs. {selectedRoom.pricePerNight}/night</p>

            <div className="mt-[18px] space-y-[12px]">
              <div>
                <label className="text-gray-400 text-[12px]">Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[10px] mt-[4px] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-[12px]">Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[10px] mt-[4px] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-[12px]">Guests</label>
                <input type="number" min={1} max={selectedRoom.capacity} value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[10px] mt-[4px] outline-none" />
              </div>
            </div>

            <button onClick={submitBooking} disabled={booking}
              className="w-full mt-[20px] bg-[#00C896] text-white py-[10px] rounded-full text-[14px] disabled:opacity-50">
              {booking ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}