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
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export default function Profile() {
  const storedUser = getStoredUser();
  const token = storedUser?.token;
  const hotelId = storedUser?._id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [hotel, setHotel] = useState(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!hotelId) {
      setError("Please login again");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/hotel/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setHotel(data);
        setDescription(data.shortDescription || "");
        setImages(data.images || []);
        setStatus(data.status || "active");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load hotel profile");
        setLoading(false);
      });
  }, [hotelId, token]);

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
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/hotel/upload-photo`, {
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
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      const res = await fetch(`${API_BASE}/api/hotel/${hotelId}`, {
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

      setHotel(data);
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
    <section id="profile" className="pb-16">
      <h2 className="text-2xl font-semibold text-white mb-6">Hotel Profile</h2>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Hotel Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <DetailRow label="Owner Name" value={`${hotel?.firstName || ""} ${hotel?.lastName || ""}`} />
          <DetailRow label="Email" value={hotel?.email} />
          <DetailRow label="NIC" value={hotel?.NIC} />
          <DetailRow label="Mobile" value={hotel?.mobile} />
          <DetailRow label="Country" value={hotel?.country} />
          <DetailRow label="Hotel Name" value={hotel?.hotelName} />
          <DetailRow label="Hotel Type" value={hotel?.hotelType} />
          <DetailRow label="Phone 1" value={hotel?.phone1} />
          <DetailRow label="Phone 2" value={hotel?.phone2} />
          <DetailRow label="Province" value={hotel?.province} />
          <DetailRow label="District" value={hotel?.district} />
          <DetailRow label="Location" value={hotel?.location} />
          <DetailRow label="BR Number" value={hotel?.BRnumber} />
          <DetailRow label="License Number" value={hotel?.licenseNumber} />
          <DetailRow
            label="Approval Status"
            value={hotel?.isApproved ? "Approved" : "Pending Approval"}
          />
        </div>

        {hotel?.facilities && (
          <div className="mt-5">
            <p className="text-gray-400 mb-2">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(hotel.facilities)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <span
                    key={key}
                    className="bg-[#1B2B34] text-[#00C896] text-xs px-3 py-1 rounded-full capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                ))}
              {hotel.otherFacility?.map((item, index) => (
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
          <h3 className="text-lg font-medium text-white">Hotel Status</h3>
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
            ? "Your hotel is visible to travelers."
            : "Your hotel is hidden from travelers. Enable it to receive bookings again."}
        </p>
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896] resize-none"
          placeholder="Tell travelers about your hotel..."
        />
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">
          Images ({images.length}/5)
        </h3>
        <div className="flex flex-wrap gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative w-28 h-28">
              <img
                src={img}
                alt={`hotel-${index}`}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                <FaTimes />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className="w-28 h-28 rounded-xl border-2 border-dashed border-[#4A5C6A] flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#00C896] hover:text-[#00C896] transition-all">
              <FaCamera className="mb-1" />
              <span className="text-xs">
                {uploading ? "Uploading..." : "Add"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
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
