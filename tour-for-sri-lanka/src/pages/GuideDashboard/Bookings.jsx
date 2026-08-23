import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { FaCalendarCheck, FaCheck, FaTimes, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";

const API_BASE = `${API_BASE_URL}/api`

export default function Bookings({guide, onClose, onSuccess}) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings(){
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if(!token){
      setLoading(false)
      return
    }

    try{
      const res = await fetch(`${API_BASE}/guidebooking/incoming`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if(res.ok){
        setBookings(data)
      }
    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  }

  async function handleStatusChange(bookingId, status){
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")

    try{
      const res = await fetch(`${API_BASE}/guidebooking/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if(!res.ok){
        throw new Error("Failed to update booking")
      }

      const updated = await res.json()
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
      toast.success(`Booking ${status}`)
    }catch(err){
      toast.error(err.message || "Something went wrong")
    }
  }

  return (
    <section id="bookings" className="mt-12">
      <h1 className="text-[#CCD0CF] text-[24px] font-bold mb-6">Bookings</h1>

      {loading ? (
        <div className="bg-[#253745] rounded-[20px] p-10 flex flex-col items-center justify-center text-center">
          <p className="text-[#CCD0CF]/60 text-[14px]">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#253745] rounded-[20px] p-10 flex flex-col items-center justify-center text-center">
          <FaCalendarCheck className="text-[#4A5C6A] text-[40px] mb-3" />
          <p className="text-[#CCD0CF]/60 text-[14px]">
            No booking requests yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[16px]">
          {bookings.map((b) => (
            <div key={b._id} className="bg-[#253745] rounded-[20px] p-[20px] flex items-center justify-between flex-wrap gap-[16px]">
              <div className="flex items-center gap-[14px]">
                <div className="w-[48px] h-[48px] rounded-full bg-[#4A5C6A] overflow-hidden flex items-center justify-center">
                  {b.travelerId?.image ? (
                    <img src={b.travelerId.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-[#CCD0CF]/60" />
                  )}
                </div>
                <div>
                  <p className="text-[#CCD0CF] font-semibold text-[15px]">
                    {b.travelerId?.firstName} {b.travelerId?.lastName}
                  </p>
                  <p className="text-[#CCD0CF]/60 text-[13px]">
                    {new Date(b.date).toLocaleDateString()} · {b.durationType === "hourly" ? `${b.quantity} hrs` : `${b.quantity} days`} · {b.numberOfGuests} guests
                  </p>
                  {b.message && (
                    <p className="text-[#CCD0CF]/50 text-[12px] mt-[4px] italic">"{b.message}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-[12px]">
                <span className={`text-[11px] px-[12px] py-[4px] rounded-full font-medium ${
                  b.status === "confirmed" ? "bg-[#00C896]/20 text-[#00C896]" :
                  b.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                  b.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {b.status}
                </span>

                {b.status === "pending" && (
                  <div className="flex gap-[8px]">
                    <button
                      onClick={() => handleStatusChange(b._id, "confirmed")}
                      className="w-[34px] h-[34px] rounded-full bg-[#00C896]/20 text-[#00C896] flex items-center justify-center hover:bg-[#00C896]/30"
                      title="Accept"
                    >
                      <FaCheck size={13} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(b._id, "rejected")}
                      className="w-[34px] h-[34px] rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"
                      title="Reject"
                    >
                      <FaTimes size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}