import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt, FaWifi, FaSwimmingPool, FaParking, FaSnowflake,
  FaSpa, FaDog, FaDumbbell, FaGlassMartiniAlt, FaTv, FaBath,
  FaStar, FaUserFriends, FaBed, FaTimes, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaPhone
} from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import HotelReviews from "./HotelReviews";
import Footer from "../../components/Footer";

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

function RoomImageCarousel ({images, isHovered}){
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if(!isHovered || images.length <= 1){
            setActiveIndex(0)
            return
        }
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        },4000)
        return () => clearInterval(interval)
    }, [isHovered, images.length])
    return(
        <div className="w-full h-[160px] relative overflow-hidden">
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        i === activeIndex ? "opacity-100" : "opacity-0"
                    }`}
                />
            ))}
        </div>
    )
}

function RoomCard({ room, onBook }) {
    const [isHovered, setIsHovered] = useState(false)
    const images = room.images && room.images.length > 0 ? room.images : ["/room_placeholder.jpg"]

    return (
        <div
            className="bg-[#253745] rounded-[18px] overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <RoomImageCarousel images={images} isHovered={isHovered} />
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
                        onClick={() => onBook(room)}
                        className="border border-[#00C896] text-[#00C896] px-[16px] py-[8px] rounded-full text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function HotelDetailsPage(){
  const { id } = useParams()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)

  const todayISO = new Date().toISOString().split("T")[0]

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
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
      const traveler = storedUser ? JSON.parse(storedUser) : null

      if(!traveler){
        toast.error("Please login to book a room")
        setBooking(false)
        return
      }

      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      const totalPrice = nights * selectedRoom.pricePerNight

      const res = await fetch(`${API_BASE}/booking/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hotelId: id,
          roomId: selectedRoom._id,
          travelerId: traveler._id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
          totalPrice
        })
      })
      const data = await res.json().catch(() => ({}))

      if(!res.ok){
        throw new Error(data.message || "Booking submit failed")
      }
      toast.success("Booking request sent")
      setSelectedRoom(null)
      setCheckIn("")
      setCheckOut("")
      setGuests(1)
    }catch(err){
      toast.error("This room is already booked for the selected dates. Please choose different dates or another room.")
    }finally{
      setBooking(false)
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
    <div className="min-h-screen bg-[#1a2530] pt-28">
        <Navbar/>
        {/* Hero image gallery */}
        <div className="relative h-[420px] px-4">
            <div className="relative h-full rounded-[30px] overflow-hidden group">
                {imagesArray.map((img, i) => (
                    <img
                        key={i}
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
              {hotel.phone1 && (
                <div className="flex items-center gap-1 mt-[6px] text-gray-400 text-[14px]">
                    <FaPhone className="text-[#00C896]"/>
                    <span>{hotel.phone1}{hotel.phone2 ? `/ ${hotel.phone2}` : ""}</span>
                </div>
              )}
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

          {rooms.filter((room) => room.status !== "maintenance").length === 0 ? (
            <p className="text-gray-400 text-[14px]">No rooms have been added for this hotel yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                {rooms.filter((room) => room.status !== "maintenance").map((room) => (
                    <RoomCard key={room._id} room={room} onBook={setSelectedRoom} />
                ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <HotelReviews
          hotelId={id}
          reviews={reviews}
          onReviewAdded={(review, isUpdate) => {
            setReviews((prev) => 
                isUpdate
                    ? prev.map((r) => (r._id === review._id ? review : r))
                    : [review, ...prev]
            )
          }}
          onReviewDeleted={(reviewId) => {
            setReviews((prev) => prev.filter((r) => r._id !== reviewId))
          }}
        />
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
                <input type="date" value={checkIn} min={todayISO}
                    onChange={(e) => {
                        const newCheckIn = e.target.value
                        setCheckIn(newCheckIn)
                        if(checkOut && checkOut <= newCheckIn){
                            setCheckOut("")
                        }
                    }}
                  className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[10px] mt-[4px] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-[12px]">Check-out</label>
                <input type="date" value={checkOut} min={checkIn || todayISO}
                    onChange={(e) => setCheckOut(e.target.value)}
                    disabled={!checkIn}
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
              {booking ? "Booking..." : "Request Booking"}
            </button>
          </div>
        </div>
      )}
      <div className="mt-[60px]">
        <Footer/>
      </div>
    </div>
  )
}