import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { FaCamera, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = `${API_BASE_URL}`;

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#1B2B34] pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 text-right break-words">
        {value || "-"}
      </span>
    </div>
  );
}

function getStoredUser() {
  const raw =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!raw) return null;

  try {
    const user = JSON.parse(raw);
    return { ...user, token };
  } catch {
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load hotel profile");
        }

        return data;
      })
      .then((data) => {
        setHotel(data);
        setDescription(data.shortDescription || "");
        setImages(data.images || []);
        setStatus(data.status || "active");
      })
      .catch(() => {
        setError("Failed to load hotel profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (images.length >= 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`${API_BASE}/api/hotel/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Image upload failed");
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
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
        return;
      }

      setHotel(data);
      setDescription(data.shortDescription || "");
      setImages(data.images || []);
      setStatus(data.status || "active");

      setNewPassword("");
      setConfirmPassword("");

      setMessage("Profile updated successfully");
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section
        id="profile"
        className="w-full max-w-[1100px] mx-auto text-[#CCD0CF] py-10"
      >
        Loading profile...
      </section>
    );
  }

  return (
    <section
      id="profile"
      className="w-full max-w-[1100px] mx-auto flex flex-col items-start pb-16"
    >
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <h2 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">
          Hotel Profile
        </h2>
      </div>

      {/* Hotel Details */}
      <div className="w-full bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-6">
        <h3 className="text-[#CCD0CF] text-lg font-bold mb-5">
          Hotel Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <DetailRow
            label="Owner Name"
            value={`${hotel?.firstName || ""} ${
              hotel?.lastName || ""
            }`.trim()}
          />

          <DetailRow
            label="Email"
            value={hotel?.email}
          />

          <DetailRow
            label="NIC / Passport"
            value={hotel?.nicOrPassport}
          />

          <DetailRow
            label="Mobile"
            value={hotel?.ownerMobile}
          />

          <DetailRow
            label="Hotel Name"
            value={hotel?.name}
          />

          <DetailRow
            label="Hotel Type"
            value={hotel?.hotelType}
          />

          <DetailRow
            label="Phone 1"
            value={hotel?.phone1}
          />

          <DetailRow
            label="Phone 2"
            value={hotel?.phone2}
          />

          <DetailRow
            label="District"
            value={hotel?.district}
          />

          <DetailRow
            label="Address"
            value={hotel?.address}
          />

          <DetailRow
            label="BR Number"
            value={hotel?.BRnumber}
          />

          <DetailRow
            label="License Number"
            value={hotel?.licenseNumber}
          />

          <DetailRow
            label="Approval Status"
            value={
              hotel?.isApproved
                ? "Approved"
                : "Pending Approval"
            }
          />
        </div>

        {hotel?.facilities && (
          <div className="mt-6">
            <p className="text-gray-400 mb-2 text-sm">
              Facilities
            </p>

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

        <p className="text-gray-500 text-xs mt-5">
          These details can't be edited here. Contact support if
          any of this information needs to change.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/40 text-red-400 rounded-[16px] px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="w-full bg-[#00C896]/10 border border-[#00C896]/40 text-[#00C896] rounded-[16px] px-4 py-3 mb-5 text-sm">
          {message}
        </div>
      )}

      {/* Hotel Status */}
      <div className="w-full bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[#CCD0CF] text-lg font-bold mb-1">
              Hotel Status
            </h3>

            <p className="text-[#CCD0CF]/60 text-sm">
              {status === "active"
                ? "Your hotel is visible to travelers."
                : "Your hotel is hidden from travelers. Enable it to receive bookings again."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setStatus((prev) =>
                prev === "active" ? "disabled" : "active"
              )
            }
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              status === "active"
                ? "bg-[#00C896] text-white hover:opacity-90"
                : "bg-[#4A5C6A] text-[#CCD0CF] hover:bg-[#4A5C6A]/80"
            }`}
          >
            {status === "active" ? "Active" : "Disabled"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="w-full bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-6">
        <h3 className="text-[#CCD0CF] text-lg font-bold mb-3">
          Description
        </h3>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell travelers about your hotel..."
          className="w-full bg-[#1B2B34] text-[#CCD0CF] rounded-[14px] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00C896] resize-none placeholder:text-[#CCD0CF]/30"
        />
      </div>

      {/* Images */}
      <div className="w-full bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-6">
        <h3 className="text-[#CCD0CF] text-lg font-bold mb-4">
          Images ({images.length}/5)
        </h3>

        <div className="flex flex-wrap gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative w-[100px] h-[100px] sm:w-[112px] sm:h-[112px]"
            >
              <img
                src={img}
                alt={`hotel-${index}`}
                className="w-full h-full object-cover rounded-[12px]"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-[#CD2F31] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:opacity-90"
              >
                <FaTimes />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className="w-[100px] h-[100px] sm:w-[112px] sm:h-[112px] rounded-[12px] border-2 border-dashed border-[#4A5C6A] flex flex-col items-center justify-center text-[#CCD0CF]/50 cursor-pointer hover:border-[#00C896] hover:text-[#00C896] transition-all">
              <FaCamera className="mb-2 text-lg" />

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

      {/* Change Password */}
      <div className="w-full bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-6">
        <h3 className="text-[#CCD0CF] text-lg font-bold mb-4">
          Change Password
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="New password"
              className="w-full h-[46px] bg-[#1B2B34] text-[#CCD0CF] rounded-[14px] px-4 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#00C896] placeholder:text-[#CCD0CF]/30"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CCD0CF]/50 hover:text-[#CCD0CF] cursor-pointer"
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
            className="w-full h-[46px] bg-[#1B2B34] text-[#CCD0CF] rounded-[14px] px-4 text-sm outline-none focus:ring-2 focus:ring-[#00C896] placeholder:text-[#CCD0CF]/30"
          />
        </div>

        <p className="text-[#CCD0CF]/40 text-xs mt-3">
          Leave blank if you don't want to change your password.
        </p>
      </div>

      {/* Save */}
      <div className="w-full flex justify-start">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00C896] text-white font-semibold px-7 py-3 rounded-[14px] text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}