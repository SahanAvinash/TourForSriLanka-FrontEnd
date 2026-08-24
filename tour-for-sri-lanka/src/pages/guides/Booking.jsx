import { API_BASE_URL } from "../../config/api";
import { useState } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const API_BASE = `${API_BASE_URL}/api`;

export default function Booking({ guide, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: "",
    durationType: "hourly",
    quantity: 1,
    guests: 1,
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const unitPrice =
    formData.durationType === "hourly"
      ? guide.pricePerHour
      : guide.pricePerDay;

  const totalPrice =
    unitPrice * Number(formData.quantity || 0);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (Number(formData.guests) > guide.maximumGuests) {
      toast.error(
        `This guide allows a maximum of ${guide.maximumGuests} guests`
      );
      return;
    }

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      toast.error("Please login to book a guide");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/guidebooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guideId: guide._id,
          date: formData.date,
          durationType: formData.durationType,
          quantity: Number(formData.quantity),
          numberOfGuests: Number(formData.guests),
          message: formData.message,
          totalPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Booking failed");
      }

      const savedBooking = await res.json();

      toast.success("Booking request sent!");

      onSuccess?.(savedBooking);
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3 sm:px-4 py-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#253745] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 md:p-7 w-full max-w-[480px] max-h-[95vh] overflow-y-auto relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-[18px] sm:right-[18px] text-gray-400 hover:text-white transition"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="pr-8">
          <h2 className="text-white font-bold text-[18px] sm:text-[20px]">
            Book This Guide
          </h2>

          <p className="text-gray-400 text-[11px] sm:text-[13px] mt-1">
            {guide.firstName} {guide.lastName} · {guide.district}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-5"
        >
          {/* Date */}
          <div className="min-w-0">
            <label className="text-gray-300 text-[12px] sm:text-[13px] block mb-1.5">
              Date
            </label>

            <div className="relative w-full min-w-0">
              <FaCalendarAlt className="absolute left-3 sm:left-[14px] top-1/2 -translate-y-1/2 text-[#00C896] text-[13px] sm:text-[14px] pointer-events-none z-10" />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="block w-full min-w-0 max-w-full appearance-none bg-[#1a2530] text-white text-[13px] sm:text-[14px] rounded-[10px] pl-9 sm:pl-[38px] pr-2 sm:pr-3 py-2.5 outline-none border border-transparent focus:border-[#00C896]/50"
                required
              />
            </div>
          </div>

          {/* Booking Type */}
          <div>
            <label className="text-gray-300 text-[12px] sm:text-[13px] block mb-1.5">
              Booking Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    durationType: "hourly",
                  }))
                }
                className={`w-full py-2.5 px-3 rounded-[10px] text-[12px] sm:text-[13px] font-medium transition ${
                  formData.durationType === "hourly"
                    ? "bg-[#00C896] text-white"
                    : "bg-[#1a2530] text-gray-400 hover:text-white"
                }`}
              >
                Per Hour ({guide.currency} {guide.pricePerHour})
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    durationType: "daily",
                  }))
                }
                className={`w-full py-2.5 px-3 rounded-[10px] text-[12px] sm:text-[13px] font-medium transition ${
                  formData.durationType === "daily"
                    ? "bg-[#00C896] text-white"
                    : "bg-[#1a2530] text-gray-400 hover:text-white"
                }`}
              >
                Per Day ({guide.currency} {guide.pricePerDay})
              </button>
            </div>
          </div>

          {/* Quantity + Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="text-gray-300 text-[12px] sm:text-[13px] block mb-1.5">
                Number of{" "}
                {formData.durationType === "hourly"
                  ? "Hours"
                  : "Days"}
              </label>

              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="block w-full min-w-0 bg-[#1a2530] text-white text-[13px] sm:text-[14px] rounded-[10px] px-3 py-2.5 outline-none border border-transparent focus:border-[#00C896]/50"
                required
              />
            </div>

            <div className="min-w-0">
              <label className="text-gray-300 text-[12px] sm:text-[13px] block mb-1.5">
                Guests (max {guide.maximumGuests})
              </label>

              <input
                type="number"
                name="guests"
                min="1"
                max={guide.maximumGuests}
                value={formData.guests}
                onChange={handleChange}
                className="block w-full min-w-0 bg-[#1a2530] text-white text-[13px] sm:text-[14px] rounded-[10px] px-3 py-2.5 outline-none border border-transparent focus:border-[#00C896]/50"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-gray-300 text-[12px] sm:text-[13px] block mb-1.5">
              Message (optional)
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Anything the guide should know..."
              className="block w-full min-w-0 bg-[#1a2530] text-white text-[13px] sm:text-[14px] rounded-[10px] px-3 py-2.5 outline-none resize-none border border-transparent focus:border-[#00C896]/50"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between gap-3 bg-[#1a2530] rounded-[10px] px-3 sm:px-4 py-3">
            <span className="text-gray-400 text-[12px] sm:text-[13px]">
              Total
            </span>

            <span className="text-[#00C896] font-bold text-[16px] sm:text-[18px] text-right">
              {guide.currency} {totalPrice || 0}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00C896] hover:bg-[#00b383] duration-300 text-white py-2.5 sm:py-3 rounded-full font-semibold text-[13px] sm:text-[14px] disabled:opacity-60"
          >
            {submitting
              ? "Sending..."
              : "Confirm Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}