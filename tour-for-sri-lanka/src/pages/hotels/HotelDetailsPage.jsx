import { API_BASE_URL } from "../../config/api";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaWifi,
  FaSwimmingPool,
  FaParking,
  FaSnowflake,
  FaSpa,
  FaDog,
  FaDumbbell,
  FaGlassMartiniAlt,
  FaTv,
  FaBath,
  FaStar,
  FaUserFriends,
  FaBed,
  FaTimes,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import HotelReviews from "./HotelReviews";
import Footer from "../../components/Footer";

const facilityMeta = {
  wifi: {
    icon: <FaWifi />,
    label: "Free WiFi",
  },
  parking: {
    icon: <FaParking />,
    label: "Parking",
  },
  pool: {
    icon: <FaSwimmingPool />,
    label: "Swimming Pool",
  },
  ac: {
    icon: <FaSnowflake />,
    label: "Air Conditioning",
  },
  spa: {
    icon: <FaSpa />,
    label: "Spa",
  },
  allowsPets: {
    icon: <FaDog />,
    label: "Pet Friendly",
  },
  gym: {
    icon: <FaDumbbell />,
    label: "Gym",
  },
  bar: {
    icon: <FaGlassMartiniAlt />,
    label: "Bar",
  },
  tv: {
    icon: <FaTv />,
    label: "TV",
  },
  hotWater: {
    icon: <FaBath />,
    label: "Hot Water",
  },
};

const roomFacilityLabels = {
  wifi: "WiFi",
  ac: "AC",
  tv: "TV",
  bar: "Bar",
  balcony: "Balcony",
  hotWater: "Hot Water",
  pool: "Pool",
  spa: "Spa",
  breakfast: "Breakfast",
  lunch: "Lunch",
  gym: "Gym",
};

const API_BASE = `${API_BASE_URL}/api`;

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function AnimatedBadge({
  children,
  index = 0,
  className = "",
}) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`category-card-anim ${
        inView ? "in-view" : ""
      } ${className}`}
      style={{
        animationDelay: inView
          ? `${index * 60}ms`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

function RoomImageCarousel({
  images,
  isHovered,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setActiveIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((previous) =>
        previous === images.length - 1
          ? 0
          : previous + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <div className="w-full h-[150px] sm:h-[160px] relative overflow-hidden">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt=""
          onError={(e) => {
            e.currentTarget.src =
              "/room_placeholder.jpg";
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === activeIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

function RoomCard({
  room,
  onBook,
  index = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, inView] = useInView();

  const images =
    Array.isArray(room?.images) &&
    room.images.length > 0
      ? room.images
      : ["/room_placeholder.jpg"];

  return (
    <div
      ref={ref}
      className={`bg-[#253745] rounded-[16px] sm:rounded-[18px] overflow-hidden destination-card-anim ${
        inView ? "in-view" : ""
      }`}
      style={{
        animationDelay: inView
          ? `${index * 80}ms`
          : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RoomImageCarousel
        images={images}
        isHovered={isHovered}
      />

      <div className="p-[13px] sm:p-[16px]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-[14px] sm:text-[15px] truncate min-w-0">
            {room?.roomType || "Room"}
          </h3>

          <span className="text-gray-400 text-[11px] sm:text-[12px] shrink-0">
            #{room?.roomNumber || "-"}
          </span>
        </div>

        <div className="flex items-center gap-[10px] sm:gap-[14px] mt-[8px] text-gray-400 text-[11px] sm:text-[12px]">
          <span className="flex items-center gap-1">
            <FaUserFriends />
            {room?.capacity || 0}
          </span>

          <span className="flex items-center gap-1 truncate">
            <FaBed />
            {room?.roomType || "Room"}
          </span>
        </div>

        {room?.shortDescription && (
          <p className="text-gray-400 text-[11px] sm:text-[12px] mt-[8px] line-clamp-2 leading-4 sm:leading-normal">
            {room.shortDescription}
          </p>
        )}

        <div className="flex flex-wrap gap-[5px] sm:gap-[6px] mt-[9px] sm:mt-[10px]">
          {Object.entries(roomFacilityLabels)
            .filter(
              ([key]) => room?.roomFacility?.[key]
            )
            .map(([key, label]) => (
              <span
                key={key}
                className="text-[9px] sm:text-[10px] text-gray-300 bg-[#1a2530] px-[7px] sm:px-[8px] py-[3px] rounded-full"
              >
                {label}
              </span>
            ))}
        </div>

        <div className="flex items-center justify-between gap-2 mt-[13px] sm:mt-[14px]">
          <div className="min-w-0">
            <p className="text-[#00C896] font-bold text-[14px] sm:text-[16px] truncate">
              Rs.{" "}
              {Number(
                room?.pricePerNight || 0
              ).toLocaleString()}
            </p>

            <p className="text-gray-500 text-[10px] sm:text-[11px]">
              per night
            </p>
          </div>

          <button
            type="button"
            onClick={() => onBook(room)}
            className="shrink-0 border border-[#00C896] text-[#00C896] px-[12px] sm:px-[16px] py-[7px] sm:py-[8px] rounded-full text-[11px] sm:text-[13px] hover:bg-[#00C896] hover:text-white transition-all duration-300"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function parseImages(value) {
  try {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    }
  } catch {
    return [];
  }

  return [];
}

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        sessionStorage.getItem("user") ||
        "null"
    );
  } catch {
    return null;
  }
}

export default function HotelDetailsPage() {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [selectedRoom, setSelectedRoom] =
    useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);

  const todayISO = new Date()
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const [
          hotelResponse,
          roomsResponse,
          reviewsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/hotel/${id}`),
          fetch(`${API_BASE}/addRoom/hotel/${id}`),
          fetch(`${API_BASE}/review/hotel/${id}`),
        ]);

        if (!hotelResponse.ok) {
          throw new Error("Failed to load hotel");
        }

        const hotelData =
          await hotelResponse.json();

        const roomsData =
          roomsResponse.ok
            ? await roomsResponse.json()
            : [];

        const reviewsData =
          reviewsResponse.ok
            ? await reviewsResponse.json()
            : [];

        if (cancelled) return;

        setHotel(hotelData);
        setRooms(
          Array.isArray(roomsData)
            ? roomsData
            : []
        );
        setReviews(
          Array.isArray(reviewsData)
            ? reviewsData
            : []
        );
      } catch (error) {
        if (!cancelled) {
          setHotel(null);
          toast.error(
            "Can't load hotel details"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const imagesArray =
    parseImages(hotel?.images).length > 0
      ? parseImages(hotel?.images)
      : ["/hotel_placeholder.jpg"];

  useEffect(() => {
    setActiveImage(0);
  }, [hotel?._id]);

  useEffect(() => {
    if (imagesArray.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((previous) =>
        previous === imagesArray.length - 1
          ? 0
          : previous + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [imagesArray.length]);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : null;

  async function submitBooking() {
    if (!selectedRoom) return;

    if (!checkIn || !checkOut) {
      toast.error(
        "Fill Check-in and Check-out dates"
      );
      return;
    }

    if (checkIn < todayISO) {
      toast.error(
        "Check-in date cannot be in the past"
      );
      return;
    }

    if (checkOut <= checkIn) {
      toast.error(
        "Check-out date must be after check-in date"
      );
      return;
    }

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > Number(selectedRoom.capacity)
    ) {
      toast.error(
        `Maximum ${selectedRoom.capacity} guests are allowed for this room`
      );
      return;
    }

    const traveler = getStoredUser();

    if (!traveler?._id) {
      toast.error(
        "Please login to book a room"
      );
      return;
    }

    const nights = Math.ceil(
      (new Date(checkOut) -
        new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      toast.error("Invalid booking dates");
      return;
    }

    const totalPrice =
      nights *
      Number(selectedRoom.pricePerNight || 0);

    setBooking(true);

    try {
      const res = await fetch(
        `${API_BASE}/booking/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hotelId: id,
            roomId: selectedRoom._id,
            travelerId: traveler._id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: guestCount,
            totalPrice,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Booking submit failed"
        );
      }

      toast.success(
        "Booking request sent"
      );

      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
    } catch (error) {
      toast.error(
        error.message ||
          "This room is already booked for the selected dates. Please choose different dates or another room."
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center px-4">
        <p className="text-white text-[14px] sm:text-[16px]">
          Loading...
        </p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#1a2530] flex items-center justify-center px-4">
        <p className="text-white text-[14px] sm:text-[16px]">
          Hotel not found
        </p>
      </div>
    );
  }

  const availableRooms = rooms.filter(
    (room) => room.status !== "maintenance"
  );

  return (
    <div className="min-h-screen bg-[#1a2530]">
      <Navbar />

      <main className="pt-[88px] sm:pt-28">
        <div className="relative h-[250px] sm:h-[320px] md:h-[420px] px-[10px] sm:px-4">
          <div className="relative h-full rounded-[18px] sm:rounded-[24px] md:rounded-[30px] overflow-hidden group destination-gallery-anim">
            {imagesArray.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={
                  hotel.hotelName ||
                  "Hotel"
                }
                onError={(e) => {
                  e.currentTarget.src =
                    "/hotel_placeholder.jpg";
                }}
                className={`absolute inset-0 w-full h-full object-cover object-[center_70%] transition-opacity duration-1000 ease-in-out ${
                  index === activeImage
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            ))}

            {imagesArray.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((previous) =>
                      previous === 0
                        ? imagesArray.length - 1
                        : previous - 1
                    )
                  }
                  className="absolute left-[8px] sm:left-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] rounded-full flex items-center justify-center transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-10"
                >
                  <FaChevronLeft className="text-[12px] sm:text-[16px]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((previous) =>
                      previous ===
                      imagesArray.length - 1
                        ? 0
                        : previous + 1
                    )
                  }
                  className="absolute right-[8px] sm:right-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] rounded-full flex items-center justify-center transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-10"
                >
                  <FaChevronRight className="text-[12px] sm:text-[16px]" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-[12px] sm:px-[20px] -mt-[35px] sm:-mt-[50px] md:-mt-[60px] relative z-10">
          <div className="bg-[#253745] rounded-[16px] sm:rounded-[20px] p-[16px] sm:p-[20px] md:p-[24px] shadow-xl destination-info-anim">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-[14px]">
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-[8px] sm:gap-[10px]">
                  <h1 className="text-white font-bold text-[20px] sm:text-[23px] md:text-[26px] leading-tight truncate">
                    {hotel.hotelName}
                  </h1>

                  {hotel.isApproved && (
                    <FaCheckCircle
                      className="text-[#00C896] text-[16px] sm:text-[18px] shrink-0"
                      title="Verified Hotel"
                    />
                  )}
                </div>

                {(hotel.location ||
                  hotel.district ||
                  hotel.province) && (
                  <div className="flex items-start gap-1.5 mt-[8px] text-gray-400 text-[12px] sm:text-[14px]">
                    <FaMapMarkerAlt className="text-[#00C896] shrink-0 mt-[2px]" />

                    <span className="break-words">
                      {[
                        hotel.location,
                        hotel.district,
                        hotel.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {hotel.phone1 && (
                  <div className="flex items-center gap-1.5 mt-[6px] text-gray-400 text-[12px] sm:text-[14px]">
                    <FaPhone className="text-[#00C896] shrink-0" />

                    <span className="break-all">
                      {hotel.phone1}
                      {hotel.phone2
                        ? ` / ${hotel.phone2}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-[8px] sm:gap-[6px] w-full sm:w-auto">
                {hotel.hotelType && (
                  <span className="text-[10px] sm:text-[12px] text-[#00C896] bg-[#00C896]/10 px-[10px] sm:px-[12px] py-[4px] rounded-full whitespace-nowrap">
                    {hotel.hotelType}
                  </span>
                )}

                {avgRating && (
                  <div className="flex items-center gap-1 text-white text-[12px] sm:text-[14px]">
                    <FaStar className="text-yellow-400" />

                    <span>{avgRating}</span>

                    <span className="text-gray-400">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {hotel.shortDescription && (
              <p className="text-gray-300 text-[12px] sm:text-[13px] md:text-[14px] mt-[14px] sm:mt-[16px] leading-relaxed">
                {hotel.shortDescription}
              </p>
            )}
          </div>

          <div className="mt-[24px] sm:mt-[30px]">
            <h2 className="text-white font-bold text-[18px] sm:text-[20px] mb-[12px] sm:mb-[16px]">
              Facilities
            </h2>

            <div className="flex flex-wrap gap-[7px] sm:gap-[10px]">
              {Object.entries(facilityMeta)
                .filter(
                  ([key]) =>
                    hotel.facilities?.[key]
                )
                .map(([key, meta], index) => (
                  <AnimatedBadge
                    key={key}
                    index={index}
                    className="bg-[#253745] rounded-[12px] sm:rounded-[14px] px-[10px] sm:px-[14px] py-[7px] sm:py-[8px] flex items-center gap-[6px] sm:gap-[8px]"
                  >
                    <span className="text-[#00C896] text-[12px] sm:text-[14px]">
                      {meta.icon}
                    </span>

                    <span className="text-gray-300 text-[10px] sm:text-[12px]">
                      {meta.label}
                    </span>
                  </AnimatedBadge>
                ))}

              {Array.isArray(
                hotel.otherFacility
              ) &&
                hotel.otherFacility.map(
                  (facility, index) => (
                    <AnimatedBadge
                      key={`other-${index}`}
                      index={index}
                      className="bg-[#253745] rounded-full px-[10px] sm:px-[14px] py-[7px] sm:py-[8px] flex items-center gap-[5px] sm:gap-[6px]"
                    >
                      <span className="text-[#00C896] text-[16px] sm:text-[20px]">
                        <FaCheckCircle />
                      </span>

                      <span className="text-gray-300 text-[10px] sm:text-[12px]">
                        {facility}
                      </span>
                    </AnimatedBadge>
                  )
                )}
            </div>
          </div>

          <div className="mt-[32px] sm:mt-[40px]">
            <h2 className="text-white font-bold text-[18px] sm:text-[20px] mb-[12px] sm:mb-[16px]">
              Available Rooms
            </h2>

            {availableRooms.length === 0 ? (
              <p className="text-gray-400 text-[12px] sm:text-[14px]">
                No rooms have been added for this hotel yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px] sm:gap-[20px]">
                {availableRooms.map(
                  (room, index) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      onBook={setSelectedRoom}
                      index={index}
                    />
                  )
                )}
              </div>
            )}
          </div>

          <HotelReviews
            hotelId={id}
            reviews={reviews}
            onReviewAdded={(
              review,
              isUpdate
            ) => {
              setReviews((previous) =>
                isUpdate
                  ? previous.map((item) =>
                      item._id === review._id
                        ? review
                        : item
                    )
                  : [review, ...previous]
              );
            }}
            onReviewDeleted={(reviewId) => {
              setReviews((previous) =>
                previous.filter(
                  (review) =>
                    review._id !== reviewId
                )
              );
            }}
          />
        </div>
      </main>

      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-[12px] sm:px-[16px] modal-backdrop-anim">
          <div className="animate-box bg-[#253745] rounded-[16px] sm:rounded-[20px] p-[18px] sm:p-[24px] w-full max-w-[420px] max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() =>
                setSelectedRoom(null)
              }
              className="absolute top-[13px] right-[13px] sm:top-[16px] sm:right-[16px] text-gray-400 hover:text-white p-1"
            >
              <FaTimes />
            </button>

            <h3 className="text-white font-bold text-[16px] sm:text-[18px] pr-[30px]">
              Book{" "}
              {selectedRoom.roomType}
            </h3>

            <p className="text-gray-400 text-[11px] sm:text-[12px] mt-[4px] pr-[20px]">
              Room #
              {selectedRoom.roomNumber} · Rs.{" "}
              {Number(
                selectedRoom.pricePerNight || 0
              ).toLocaleString()}
              /night
            </p>

            <div className="mt-[16px] sm:mt-[18px] space-y-[10px] sm:space-y-[12px]">
              <div>
                <label className="text-gray-400 text-[11px] sm:text-[12px]">
                  Check-in
                </label>

                <input
                  type="date"
                  value={checkIn}
                  min={todayISO}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setCheckIn(value);

                    if (
                      checkOut &&
                      checkOut <= value
                    ) {
                      setCheckOut("");
                    }
                  }}
                  className="w-full bg-[#1a2530] text-white text-[12px] sm:text-[13px] rounded-[9px] sm:rounded-[10px] p-[9px] sm:p-[10px] mt-[4px] outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[11px] sm:text-[12px]">
                  Check-out
                </label>

                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayISO}
                  onChange={(e) =>
                    setCheckOut(
                      e.target.value
                    )
                  }
                  disabled={!checkIn}
                  className="w-full bg-[#1a2530] text-white text-[12px] sm:text-[13px] rounded-[9px] sm:rounded-[10px] p-[9px] sm:p-[10px] mt-[4px] outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[11px] sm:text-[12px]">
                  Guests
                </label>

                <input
                  type="number"
                  min={1}
                  max={selectedRoom.capacity}
                  value={guests}
                  onChange={(e) => {
                    const value =
                      Number(e.target.value);

                    if (
                      value >= 1 &&
                      value <=
                        Number(
                          selectedRoom.capacity
                        )
                    ) {
                      setGuests(value);
                    }
                  }}
                  className="w-full bg-[#1a2530] text-white text-[12px] sm:text-[13px] rounded-[9px] sm:rounded-[10px] p-[9px] sm:p-[10px] mt-[4px] outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={submitBooking}
              disabled={booking}
              className="w-full mt-[17px] sm:mt-[20px] bg-[#00C896] text-white py-[9px] sm:py-[10px] rounded-full text-[12px] sm:text-[14px] disabled:opacity-50"
            >
              {booking
                ? "Booking..."
                : "Request Booking"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-[40px] sm:mt-[60px]">
        <Footer />
      </div>
    </div>
  );
}