import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  function loadTours() {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/tour`, { headers: { Authorization: "Bearer " + token } })
      .then((res) => setTours(res.data))
      .catch(() => toast.error("Failed to load tours"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTours();
  }, []);

  function handleRemove(tour) {
    if (!window.confirm("Remove this tour and all bookings made within it?")) return;
    axios
      .delete(`${API_BASE_URL}/api/tour/${tour._id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        toast.success("Tour and related bookings removed");
        loadTours();
      })
      .catch(() => toast.error("Failed to remove tour"));
  }

  const filtered = tours.filter((t) =>
    JSON.stringify(t).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#CCD0CF] text-xl font-bold">Tours</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1B2B34] text-[#CCD0CF] px-4 py-2 rounded-lg outline-none w-[250px] placeholder:text-[#4A5C6A]"
        />
      </div>

      {loading ? (
        <p className="text-[#CCD0CF]">Loading...</p>
      ) : (
        <div className="bg-[#1B2B34] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#253745]">
              <tr>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Traveler</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Destinations</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Guide</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Hotels</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Transport</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Distance</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Status</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tour) => (
                <tr
                  key={tour._id}
                  className="border-t border-[#253745] hover:bg-[#243b4a] transition-colors"
                >
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {tour.traveler ? `${tour.traveler.firstName} ${tour.traveler.lastName}` : "-"}
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {(tour.destinations || []).map((d) => d.name).join(", ") || "-"}
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {tour.selectedGuide ? `${tour.selectedGuide.firstName} ${tour.selectedGuide.lastName}` : "-"}
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {(tour.selectedHotels || []).map((h) => h.hotelName).join(", ") || "-"}
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {tour.selectedTransport
                      ? `${tour.selectedTransport.vehicleBrand || ""} ${tour.selectedTransport.vehicleModel || ""}`
                      : "-"}
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm">
                    {tour.totalDistanceKm ? `${tour.totalDistanceKm} km` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        tour.status === "confirmed"
                          ? "text-[#00C896] font-semibold"
                          : tour.status === "cancelled"
                          ? "text-red-400 font-semibold"
                          : "text-yellow-400 font-semibold"
                      }
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleRemove(tour)}
                      className="bg-red-500/80 text-white px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-[#CCD0CF] px-4 py-6">
                    No tours found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
