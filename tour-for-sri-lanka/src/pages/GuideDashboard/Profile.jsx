import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = `${API_BASE_URL}`;

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
  const guideId = storedUser?._id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [guide, setGuide] = useState(null);
  const [aboutYourSelf, setAboutYourSelf] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!guideId) {
      setError("Please login again");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/guide/${guideId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setGuide(data);
        setAboutYourSelf(data.aboutYourSelf || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [guideId, token]);

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    const payload = { aboutYourSelf };
    if (newPassword) payload.password = newPassword;

    try {
      const res = await fetch(`${API_BASE}/api/guide/${guideId}`, {
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

      setGuide(data);
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
      <h2 className="text-2xl font-semibold text-white mb-6">Guide Profile</h2>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <DetailRow label="Full Name" value={`${guide?.firstName || ""} ${guide?.lastName || ""}`} />
            <DetailRow label="Email" value={guide?.email} />
            <DetailRow label="NIC" value={guide?.NIC} />
            <DetailRow label="Mobile" value={guide?.mobile} />
            <DetailRow label="Country" value={guide?.country} />
            <DetailRow label="Nationality" value={guide?.nationality} />
            <DetailRow label="Gender" value={guide?.gender} />
            <DetailRow label="Marital Status" value={guide?.maritalStatus} />
            <DetailRow label="District" value={guide?.district} />
            <DetailRow label="Province" value={guide?.province} />
            <DetailRow label="Address" value={guide?.address} />
            <DetailRow label="License No" value={guide?.GuideLicenseNumber} />
        </div>

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
        <h3 className="text-lg font-medium text-white mb-3">About Yourself</h3>
        <textarea
          value={aboutYourSelf}
          onChange={(e) => setAboutYourSelf(e.target.value)}
          rows={4}
          className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896] resize-none"
          placeholder="Tell travelers about yourself..."
        />
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Change Password</h3>
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