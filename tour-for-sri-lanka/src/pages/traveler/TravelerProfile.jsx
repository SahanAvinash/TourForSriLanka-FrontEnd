import { useEffect, useState } from "react";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../../components/Navbar";

const API_BASE = "http://localhost:3000";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#1B2B34] pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 text-right">{value || "-"}</span>
    </div>
  );
}

function cleanToken(value) {
  return value && value !== "undefined" && value !== "null" ? value : null;
}

function getStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  const token =
    cleanToken(localStorage.getItem("token")) ||
    cleanToken(sessionStorage.getItem("token"));
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return { ...user, token };
  } catch (err) {
    return null;
  }
}

function updateStoredUser(updatedFields) {
  const isLocal = !!localStorage.getItem("user");
  const storage = isLocal ? localStorage : sessionStorage;
  const raw = storage.getItem("user");
  if (!raw) return;
  try {
    const user = JSON.parse(raw);
    const merged = { ...user, ...updatedFields };
    storage.setItem("user", JSON.stringify(merged));
  } catch (err) {}
}

export default function TravelerProfile() {
  const storedUser = getStoredUser();
  const token = storedUser?.token;
  const email = storedUser?.email;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [traveler, setTraveler] = useState(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!email) {
      setError("Please login again");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/traveler/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTraveler(data);
        setImage(data.image || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [email, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/traveler/upload-photo`, {
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

      setImage(data.url);
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    const payload = { image };
    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      const res = await fetch(`${API_BASE}/api/traveler/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      updateStoredUser({ image });
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
      <div className="min-h-screen bg-gradient-to-r from-[#06141B] to-[#253745] text-gray-300 flex items-center justify-center">
        <span className="animate-pulse">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#06141B] to-[#253745]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 profile-title-anim">
          My Profile
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl px-4 py-3 mb-5 profile-alert-anim">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-[#00C896]/10 border border-[#00C896] text-[#00C896] rounded-xl px-4 py-3 mb-5 profile-alert-anim">
            {message}
          </div>
        )}

        <div className="bg-[#11212D] rounded-2xl p-6 mb-6 flex flex-col items-center profile-photo-anim transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20">
          <div className="relative w-28 h-28 mb-4 group">
            {image ? (
              <img
                src={image}
                alt="profile"
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#1B2B34] flex items-center justify-center text-gray-500 text-3xl transition-transform duration-300 group-hover:scale-105">
                {traveler?.firstName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-[#00C896] text-white p-2 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95">
              <FaCamera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploading && (
            <p className="text-gray-400 text-xs flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
              <span className="w-3 h-3 border-2 border-gray-500 border-t-[#00C896] rounded-full animate-spin" />
              Uploading...
            </p>
          )}
          <h3 className="text-white text-lg font-medium">
            {traveler?.firstName} {traveler?.lastName}
          </h3>
          <p className="text-gray-400 text-sm">{traveler?.email}</p>
        </div>

        <div className="bg-[#11212D] rounded-2xl p-6 mb-6 profile-details-anim transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20">
          <h3 className="text-lg font-medium text-white mb-4">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <DetailRow
              label="Full Name"
              value={`${traveler?.firstName || ""} ${traveler?.lastName || ""}`}
            />
            <DetailRow label="Email" value={traveler?.email} />
            <DetailRow label="NIC" value={traveler?.NIC} />
            <DetailRow label="Mobile" value={traveler?.mobile} />
            <DetailRow label="Country" value={traveler?.country} />
            <DetailRow
              label="Verified"
              value={traveler?.isVerified ? "Yes" : "No"}
            />
          </div>
          <p className="text-gray-500 text-xs mt-4">
            These details can't be edited here. Contact support if any of this information needs to change.
          </p>
        </div>

        <div className="bg-[#11212D] rounded-2xl p-6 mb-6 profile-password-anim transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20">
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
                className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 pr-10 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-[#00C896]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 hover:text-gray-200"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 pr-10 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-[#00C896]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 hover:text-gray-200"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Leave blank if you don't want to change your password.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00C896] text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 profile-save-anim"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}