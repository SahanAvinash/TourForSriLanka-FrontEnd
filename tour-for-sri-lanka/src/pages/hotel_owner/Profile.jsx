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
        headers