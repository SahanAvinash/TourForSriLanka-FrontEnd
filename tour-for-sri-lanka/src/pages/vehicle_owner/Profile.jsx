import { useEffect, useState } from "react";
import { FaCamera, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = "http://localhost:3000";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#1B2B34] pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 text-right">{value || "-"}</span>
    </div>
  );
}

function getStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return { ...user, token };
  } catch (err) {
    return null;
  }
}

export default function Profile() {
  const storedUser = getStoredUser();
  const token = storedUser?.token;
  const transportId = storedUser?._id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [transport, setTransport] = useState(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [availableAreas, setAvailableAreas] = useState("")
  const [ratePerKm, setRatePerKm] = useState("")

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!transportId) {
      setError("Please login again");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/transport/${transportId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTransport(data);
        setDescription(data.shortDescription || "");
        setImages(data.images || []);
        setStatus(data.status || "active");
        setAvailableAreas((data.availableArea || []).join(", "))
        setRatePerKm(data.ratePerKm || "")
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [transportId, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (images.length >= 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`${API_BASE}/api/transport/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Image upload failed");
        setUploading(false);
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    const payload = {
      shortDescription: description,
      images: JSON.stringify(images),
      status,
      availableAreas: availableAreas.split(",").map((a) => a.trim()).filter(Boolean),
      ratePerKm: Number(ratePerKm)
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      const res = await fetch(`${API_BASE}/api/transport/${transportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setTransport(data);
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section id="profile" className="text-gray-300 py-10">
        Loading profile...
      </section>
    );
  }

  return (
    <section id="profile" className="pb-16 pt-10">
      <h2 className="text-2xl font-semibold text-white mb-6">Transport Owner Profile</h2>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Owner Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <DetailRow label="Owner Name" value={`${transport?.firstName || ""} ${transport?.lastName || ""}`} />
            <DetailRow label="Email" value={transport?.email} />
            <DetailRow label="NIC" value={transport?.NIC} />
            <DetailRow label="Mobile" value={transport?.mobile} />
            <DetailRow label="Country" value={transport?.country} />
            <div>
                <label className="text-gray-400 text-xs mb-1 block">Available Areas (comma seperated)</label>
                <input 
                    type="text"
                    value={availableAreas}
                    onChange={(e) => setAvailableAreas(e.target.value)}
                    placeholder="e.g. Colombo, Kandy, Galle"
                    className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none"
                />
            </div>
            <DetailRow label="Vehicle Type" value={transport?.vehicleType}/>
            <DetailRow label="Brand" value={transport?.vehicleBrand}/>
            <DetailRow label="Model" value={transport?.vehicleModel} />
            <DetailRow label="Registration No" value={transport?.registrationNo} />
            <DetailRow label="Manufacture Year" value={transport?.manufactureYear} />
            <DetailRow label="Chassis Number" value={transport?.chassisNumber} />
            <DetailRow label="Vehicle Color" value={transport?.vehicleColor} />
            <DetailRow label="Fuel Type" value={transport?.fuelType} />
            <DetailRow label="Passenger Capacity" value={transport?.passengerCapacity} />
            <DetailRow label="Luggage Capacity" value={transport?.luggageCapacity} />
            <div>
                <label className="text-gray-400 text-xs mb-1 block">Rate Per Km (Rs.)</label>
                <input
                    type="number"
                    min="1"
                    value={ratePerKm}
                    onChange={(e) => setRatePerKm(e.target.value)}
                    className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896]"
                />
            </div>
            <DetailRow
                label="Approval Status"
                value={transport?.isApproved ? "Approved" : "Pending Approval"}
            />
        </div>

        {transport?.facilities && (
          <div className="mt-5">
            <p className="text-gray-400 mb-2">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(transport.facilities)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <span
                    key={key}
                    className="bg-[#1B2B34] text-[#00C896] text-xs px-3 py-1 rounded-full capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                ))}
              {transport.otherFacility?.map((item, index) => (
                <span
                  key={`other-${index}`}
                  className="bg-[#1B2B34] text-[#00C896] text-xs px-3 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-500 text-xs mt-4">
          These details can't be edited here. Contact support if any of this information needs to change.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-[#00C896]/10 border border-[#00C896] text-[#00C896] rounded-xl px-4 py-3 mb-5">
          {message}
        </div>
      )}

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Account Status</h3>
          <button
            onClick={() =>
              setStatus((prev) => (prev === "active" ? "disabled" : "active"))
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              status === "active"
                ? "bg-[#00C896] text-white"
                : "bg-[#4A5C6A] text-gray-200"
            }`}
          >
            {status === "active" ? "Active" : "Disabled"}
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          {status === "active"
            ? "Your vehicles are visible to travelers."
            : "Your vehicles are hidden from travelers. Enable it to receive bookings again."}
        </p>
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896] resize-none"
          placeholder="Tell travelers about your transport service..."
        />
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">
          Change Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#00C896]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896]"
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Leave blank if you don't want to change your password.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#00C896] text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </section>
  );
}