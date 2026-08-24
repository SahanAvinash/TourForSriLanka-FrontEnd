import { API_BASE_URL } from "../../config/api";
import { useState } from "react";
import { FaStar, FaImage, FaTimes, FaPen } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = `${API_BASE_URL}/api`;

function getAuthHeader() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return { Authorization: `Bearer ${token}` };
}

function getCurrentUserEmail() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return decoded?.email || null;
  } catch {
    return null;
  }
}

function getReviewOwnerId(review) {
  return review.email || null;
}

function timeAgo(dateString) {
  const seconds = Math.floor(
    (new Date() - new Date(dateString)) / 1000
  );

  if (seconds < 60) return "Just Now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function HotelReviews({
  hotelId,
  reviews,
  onReviewAdded,
  onReviewDeleted,
}) {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  const currentUserEmail = getCurrentUserEmail();

  const myReview = reviews.find(
    (r) =>
      getReviewOwnerId(r) === currentUserEmail &&
      currentUserEmail !== null
  );

  const otherReviews = reviews.filter(
    (r) => !(myReview && r._id === myReview._id)
  );

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    if (reviewImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploadingImage(true);

    const uploadPromise = files.map((file) => {
      const formData = new FormData();
      formData.append("photo", file);

      return axios.post(
        `${API_BASE}/hotel/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });

    Promise.all(uploadPromise)
      .then((responses) => {
        const urls = responses.map((res) => res.data.url);

        setReviewImages((prev) => [...prev, ...urls]);
      })
      .catch(() => {
        toast.error("Image upload failed");
      })
      .finally(() => {
        setUploadingImage(false);
        e.target.value = "";
      });
  }

  function removeReviewImage(index) {
    setReviewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function startEditReview() {
    if (!myReview) return;

    setReviewRating(myReview.rating);
    setReviewComment(myReview.comment);
    setReviewImages(myReview.images || []);
    setIsEditing(true);
  }

  function cancelEditReview() {
    setIsEditing(false);
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
  }

  async function handleDeleteReview() {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/review/${currentUserEmail}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      onReviewDeleted(myReview._id);
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Review delete failed");
    }
  }

  async function submitReview() {
    if (!reviewComment.trim()) {
      toast.error(
        isEditing
          ? "Failed to update review"
          : "Failed to submit a review"
      );
      return;
    }

    setSubmittingReview(true);

    try {
      const isUpdate = isEditing && myReview;

      const url = isUpdate
        ? `${API_BASE}/review/${myReview._id}`
        : `${API_BASE}/review`;

      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          hotelId,
          rating: reviewRating,
          comment: reviewComment,
          images: reviewImages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      const savedReview = await res.json();

      onReviewAdded(savedReview, isUpdate);

      cancelEditReview();

      toast.success(
        isUpdate
          ? "Review updated successfully"
          : "Review added successfully"
      );
    } catch {
      toast.error(
        isEditing
          ? "Review update failed"
          : "Review submit failed"
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  const showForm = !myReview || isEditing;

  return (
    <div className="mt-8 sm:mt-10">

      <h2 className="text-white font-bold text-lg sm:text-xl mb-4">
        Reviews
      </h2>

      {/* My Review / Review Form */}
      <div className="bg-[#253745] rounded-[16px] sm:rounded-[18px] p-4 sm:p-5 mb-5">

        {showForm ? (
          <>
            <p className="text-gray-300 text-xs sm:text-[13px] mb-3">
              {isEditing ? "Edit your review" : "Write a review"}
            </p>

            {/* Rating */}
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar
                  key={n}
                  onClick={() => setReviewRating(n)}
                  className={`cursor-pointer text-base sm:text-[18px] ${
                    n <= reviewRating
                      ? "text-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share Your Experience"
              className="w-full bg-[#1a2530] text-white text-xs sm:text-[13px] rounded-[10px] p-3 outline-none resize-none"
              rows={4}
            />

            {/* Images */}
            <div className="flex flex-wrap gap-2.5 mt-3">

              {reviewImages.map((url, index) => (
                <div
                  key={index}
                  className="relative w-14 h-14 sm:w-[60px] sm:h-[60px] shrink-0"
                >
                  <img
                    src={url}
                    alt="review"
                    className="w-full h-full object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeReviewImage(index)}
                    className="absolute -top-2 -right-2 bg-[#CD2F31] rounded-full w-[18px] h-[18px] flex items-center justify-center text-white text-[9px]"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {reviewImages.length < 5 && (
                <label className="w-14 h-14 sm:w-[60px] sm:h-[60px] shrink-0 rounded-lg border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300">

                  {uploadingImage ? (
                    <span className="text-[10px]">...</span>
                  ) : (
                    <FaImage size={17} />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}

            </div>

            {/* Buttons */}
            <div className="flex flex-col xs:flex-row sm:flex-row gap-2.5 mt-5">

              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="bg-[#00C896] text-white px-5 py-2 rounded-full text-xs sm:text-[13px] disabled:opacity-50 w-full sm:w-auto"
              >
                {submittingReview
                  ? "Submitting..."
                  : isEditing
                  ? "Update Review"
                  : "Submit Review"}
              </button>

              {isEditing && (
                <button
                  onClick={cancelEditReview}
                  disabled={submittingReview}
                  className="text-gray-300 px-5 py-2 rounded-full text-xs sm:text-[13px] border border-[#4A5C6A] w-full sm:w-auto"
                >
                  Cancel
                </button>
              )}

            </div>
          </>
        ) : (
          <>
            {/* My Review Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

              <p className="text-gray-300 text-xs sm:text-[13px]">
                Your review
              </p>

              <div className="flex items-center gap-4">

                <button
                  onClick={startEditReview}
                  className="flex items-center gap-1 text-[#00C896] text-xs shrink-0"
                >
                  <FaPen size={10} />
                  Edit
                </button>

                <button
                  onClick={handleDeleteReview}
                  className="flex items-center gap-1 text-[#CD2F31] text-xs shrink-0"
                >
                  <FaTimes size={10} />
                  Delete
                </button>

              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar
                  key={n}
                  className={`text-[13px] ${
                    n <= myReview.rating
                      ? "text-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-300 text-xs sm:text-[13px] leading-relaxed break-words">
              {myReview.comment}
            </p>

            {myReview.images?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">

                {myReview.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="review"
                    onClick={() => setPopupImage(img)}
                    className="w-14 h-14 sm:w-[60px] sm:h-[60px] object-cover rounded-lg cursor-pointer"
                  />
                ))}

              </div>
            )}
          </>
        )}
      </div>

      {/* Other Reviews */}
      {otherReviews.length === 0 ? (
        myReview ? null : (
          <p className="text-gray-400 text-xs sm:text-[14px]">
            No any reviews
          </p>
        )
      ) : (
        <div className="space-y-3">

          {otherReviews.map((r, i) => (
            <div
              key={r._id || i}
              className="bg-[#253745] rounded-[14px] p-4 sm:p-5"
            >

              {/* User Header */}
              <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-2.5 min-w-0">

                  <div className="w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] font-bold text-sm sm:text-base shrink-0 overflow-hidden">

                    {r.profileImage ? (
                      <img
                        src={r.profileImage}
                        alt={r.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (r.firstName || "T")
                        .charAt(0)
                        .toUpperCase()
                    )}

                  </div>

                  <span className="text-white font-bold text-sm sm:text-base truncate">
                    {r.firstName || "Traveler"}
                  </span>

                </div>

                {/* Rating + Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 shrink-0">

                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-xs sm:text-[14px]" />

                    <span className="text-gray-300 text-xs sm:text-[13px]">
                      {r.rating.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-gray-500 text-[10px] sm:text-xs">
                    {timeAgo(r.date)}
                  </span>

                </div>

              </div>

              {/* Comment */}
              <p className="text-gray-300 text-xs sm:text-[13px] mt-3 leading-relaxed break-words">
                {r.comment}
              </p>

            </div>
          ))}

        </div>
      )}

      {/* Image Popup */}
      {popupImage && (
        <div
          onClick={() => setPopupImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-4 py-6"
        >

          <button
            onClick={() => setPopupImage(null)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white text-xl sm:text-[22px]"
          >
            <FaTimes />
          </button>

          <img
            src={popupImage}
            alt="review full"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[80vh] rounded-xl object-contain"
          />

        </div>
      )}

    </div>
  );
}