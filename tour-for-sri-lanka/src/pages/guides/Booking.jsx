import { useState } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api"

export default function Booking({ guide, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: "",
    durationType: "hourly", // "hourly" | "daily"
    quantity: 1,
    guests: 1,
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e){
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const unitPrice = formData.durationType === "hourly" ? guide.pricePerHour : guide.pricePerDay
  const totalPrice = unitPrice * Number(formData.quantity || 0)

  async function handleSubmit(e){
    e.preventDefault()

    if(!formData.date){
      toast.error("Please select a date")
      return
    }
    if(Number(formData.guests) > guide.maximumGuests){
      toast.error(`This guide allows a maximum of ${guide.maximumGuests} guests`)
      return
    }
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    console.log("LOCAL:",localStorage.getItem("token"))
    console.log("SESSION:",sessionStorage.getItem("token"))
    console.log("FINAL TOKEN:",token)
    if(!token){
        toast.error("Please login to book a guide")
        return
    }

    setSubmitting(true)
    try{
      const res = await fetch(`${API_BASE}/guidebooking`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          guideId: guide._id,
          date: formData.date,
          durationType: formData.durationType,
          quantity: Number(formData.quantity),
          numberOfGuests: Number(formData.guests),
          message: formData.message,
          totalPrice
        })
      })

      if(!res.ok){
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Booking failed")
      }
      const savedBooking = await res.json()

      toast.success("Booking request sent!")
      onSuccess?.(savedBooking)
      onClose()
    }catch(err){
      toast.error(err.message || "Something went wrong")
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#253745] rounded-[20px] p-[28px] w-full max-w-[480px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[18px] right-[18px] text-gray-400 hover:text-white"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-white font-bold text-[20px] mb-[4px]">Book This Guide</h2>
        <p className="text-gray-400 text-[13px] mb-[20px]">
          {guide.firstName} {guide.lastName} · {guide.district}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">

          <div>
            <label className="text-gray-300 text-[13px] block mb-[6px]">Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#1a2530] text-white text-[14px] rounded-[10px] pl-[38px] pr-[12px] py-[10px] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-[13px] block mb-[6px]">Booking Type</label>
            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, durationType: "hourly" }))}
                className={`flex-1 py-[10px] rounded-[10px] text-[13px] font-medium ${
                  formData.durationType === "hourly"
                    ? "bg-[#00C896] text-white"
                    : "bg-[#1a2530] text-gray-400"
                }`}
              >
                Per Hour ({guide.currency} {guide.pricePerHour})
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, durationType: "daily" }))}
                className={`flex-1 py-[10px] rounded-[10px] text-[13px] font-medium ${
                  formData.durationType === "daily"
                    ? "bg-[#00C896] text-white"
                    : "bg-[#1a2530] text-gray-400"
                }`}
              >
                Per Day ({guide.currency} {guide.pricePerDay})
              </button>
            </div>
          </div>

          <div className="flex gap-[16px]">
            <div className="flex-1">
              <label className="text-gray-300 text-[13px] block mb-[6px]">
                Number of {formData.durationType === "hourly" ? "Hours" : "Days"}
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-[#1a2530] text-white text-[14px] rounded-[10px] px-[12px] py-[10px] outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-300 text-[13px] block mb-[6px]">
                Guests (max {guide.maximumGuests})
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                max={guide.maximumGuests}
                value={formData.guests}
                onChange={handleChange}
                className="w-full bg-[#1a2530] text-white text-[14px] rounded-[10px] px-[12px] py-[10px] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-[13px] block mb-[6px]">Message (optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Anything the guide should know..."
              className="w-full bg-[#1a2530] text-white text-[14px] rounded-[10px] px-[12px] py-[10px] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between bg-[#1a2530] rounded-[10px] px-[16px] py-[12px]">
            <span className="text-gray-400 text-[13px]">Total</span>
            <span className="text-[#00C896] font-bold text-[18px]">
              {guide.currency} {totalPrice || 0}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00C896] hover:bg-[#00b383] duration-300 text-white py-[12px] rounded-full font-semibold disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Confirm Booking Request"}
          </button>
        </form>
      </div>
    </div>
  )
}