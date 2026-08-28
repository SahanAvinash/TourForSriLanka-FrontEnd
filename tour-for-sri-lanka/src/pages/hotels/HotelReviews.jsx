import { API_BASE_URL } from "../../config/api";
import { useState } from "react";
import {
  FaStar,
  FaImage,
  FaTimes,
  FaPen,
} from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = `${API_BASE_URL}/api`;

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function getAuthHeader() {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function getCurrentUserEmail() {
  const token = getToken();

  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(base64)
    );

    return decoded?.email || null;
  } catch {
    return null;
  }
}

function getReviewOwnerId(review) {
  return review?.email || null;
}

function timeAgo(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) return "Just Now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
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
  reviews = [],
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
    (review) =>
      getReviewOwnerId(review) ===
        currentUserEmail &&
      currentUserEmail !== null
  );

  const otherReviews = reviews.filter(
    (review) =>
      !(myReview && review._id === myReview._id)
  );

  function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (reviewImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);

    const uploadRequests = files.map((file) => {
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

    Promise.all(uploadRequests)
      .then((responses) => {
        const urls = responses
          .map((response) => response?.data?.url)
          .filter(Boolean);

        if (!urls.length) {
          throw new Error("Upload failed");
        }

        setReviewImages((prev) => [
          ...prev,
          ...urls,
        ]);
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

    setReviewRating(Number(myReview.rating) || 5);
    setReviewComment(myReview.comment || "");
    setReviewImages(
      Array.isArray(myReview.images)
        ? myReview.images
        : []
    );
    setIsEditing(true);
  }

  function cancelEditReview() {
    setIsEditing(false);
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
  }

  async function handleDeleteReview() {
    if (!myReview || !currentUserEmail) {
      toast.error("Unable to identify your review");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete your review?"
      )
    ) {
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || "Review delete failed"
        );
      }

      onReviewDeleted?.(myReview._id);

      toast.success(
        "Review deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.message || "Review delete failed"
      );
    }
  }

  async function submitReview() {
    const comment = reviewComment.trim();

    if (!comment) {
      toast.error(
        isEditing
          ? "Please enter your review"
          : "Please write a review"
      );
      return;
    }

    if (!hotelId) {
      toast.error("Hotel information is missing");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    setSubmittingReview(true);

    try {
      const isUpdate =
        isEditing && Boolean(myReview);

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
          comment,
          images: reviewImages,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            (isUpdate
              ? "Review update failed"
              : "Review submit failed")
        );
      }

      onReviewAdded?.(data, isUpdate);

      cancelEditReview();

      toast.success(
        isUpdate
          ? "Review updated successfully"
          : "Review added successfully"
      );
    } catch (error) {
      toast.error(
        error.message ||
          (isEditing
            ? "Review update failed"
            : "Review submit failed")
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  const showForm = !myReview || isEditing;

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-white font-bold text-xl sm:text-2xl">
          Reviews
        </h2>

        <span className="text-[#00C896] bg-[#00C896]/10 text-xs font-semibold px-2.5 py-1 rounded-full">
          {reviews.length}
        </span>
      </div>

      <div className="bg-[#253745] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-5 shadow-lg shadow-black/10">
        {showForm ? (
          <>
            <p className="text-white font-semibold text-sm sm:text-[15px] mb-4">
              {isEditing
                ? "Edit your review"
                : "Write a review"}
            </p>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() =>
                    setReviewRating(number)
                  }
                  className="transition-transform duration-150 hover:scale-110"
                >
                  <FaStar
                    className={`cursor-pointer text-xl sm:text-2xl transition-colors duration-150 ${
                      number <= reviewRating
                        ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.35)]"
                        : "text-white/15"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) =>
                setReviewComment(e.target.value)
              }
              placeholder="Share Your Experience"
              className="w-full bg-[#1a2530] text-white text-sm rounded-xl p-4 outline-none resize-none border border-transparent focus:border-[#00C896]/40 focus:ring-2 focus:ring-[#00C896]/10 transition-all duration-200 placeholder:text-gray-500"
              rows={4}
              maxLength={1000}
            />

            <div className="flex flex-wrap gap-3 mt-4">
              {reviewImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative w-16 h-16 sm:w-[68px] sm:h-[68px] shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10"
                >
                  <img
                    src={url}
                    alt="Review"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeReviewImage(index)
                    }
                    className="absolute -top-1.5 -right-1.5 bg-[#CD2F31] rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] shadow-md hover:bg-red-600 transition-colors duration-150"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {reviewImages.length < 5 && (
                <label className="w-16 h-16 sm:w-[68px] sm:h-[68px] shrink-0 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center cursor-pointer text-white/30 hover:text-[#00C896] hover:border-[#00C896]/60 hover:bg-[#00C896]/5 transition-all duration-200">
                  {uploadingImage ? (
                    <span className="text-[10px]">
                      ...
                    </span>
                  ) : (
                    <FaImage size={18} />
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

            <div className="flex flex-col xs:flex-row sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={submitReview}
                disabled={submittingReview || uploadingImage}
                className="bg-[#00C896] hover:bg-[#00b383] text-white px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 w-full sm:w-auto transition-colors duration-200 shadow-md shadow-[#00C896]/20"
              >
                {submittingReview
                  ? "Submitting..."
                  : isEditing
                  ? "Update Review"
                  : "Submit Review"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEditReview}
                  disabled={submittingReview}
                  className="text-gray-300 hover:text-white hover:border-white/30 px-6 py-2.5 rounded-full text-sm font-semibold border border-white/15 w-full sm:w-auto transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-white font-semibold text-sm sm:text-[15px]">
                Your review
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startEditReview}
                  className="flex items-center gap-1.5 text-[#00C896] bg-[#00C896]/10 hover:bg-[#00C896]/20 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-colors duration-200"
                >
                  <FaPen size={10} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="flex items-center gap-1.5 text-[#CD2F31] bg-[#CD2F31]/10 hover:bg-[#CD2F31]/20 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-colors duration-200"
                >
                  <FaTimes size={10} />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((number) => (
                <FaStar
                  key={number}
                  className={`text-sm ${
                    number <=
                    Number(myReview.rating)
                      ? "text-yellow-400"
                      : "text-white/15"
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed break-words">
              {myReview.comment}
            </p>

            {myReview.images?.length > 0 && (
              <div className="flex gap-2.5 mt-4 flex-wrap">
                {myReview.images.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-[#00C896]/50 transition-all duration-200"
                      onClick={() =>
                        setPopupImage(image)
                      }
                    >
                      <img
                        src={image}
                        alt="Review"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {otherReviews.length === 0 ? (
        myReview ? null : (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-[#253745]/40 rounded-2xl border border-dashed border-white/10">
            <FaStar className="text-white/10 text-3xl mb-3" />

            <p className="text-gray-400 text-sm">
              No reviews yet
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {otherReviews.map((review, index) => (
            <div
              key={review._id || index}
              className="bg-[#253745] border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-[#00C896]/25 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#00C896]/30 to-[#00C896]/5 ring-2 ring-[#00C896]/20 flex items-center justify-center text-[#00C896] font-bold text-sm sm:text-base shrink-0 overflow-hidden">
                    {review.profileImage ? (
                      <img
                        src={review.profileImage}
                        alt={
                          review.firstName ||
                          "Traveler"
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        review.firstName ||
                        "T"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <span className="text-white font-bold text-sm sm:text-base truncate">
                    {review.firstName ||
                      "Traveler"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                    <FaStar className="text-yellow-400 text-[11px] sm:text-xs" />

                    <span className="text-yellow-400 text-xs sm:text-[13px] font-semibold">
                      {Number(
                        review.rating || 0
                      ).toFixed(1)}
                    </span>
                  </div>

                  <span className="text-gray-500 text-[10px] sm:text-xs">
                    {timeAgo(review.date)}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mt-3.5 leading-relaxed break-words">
                {review.comment}
              </p>

              {review.images?.length > 0 && (
                <div className="flex gap-2.5 mt-4 flex-wrap">
                  {review.images.map(
                    (image, imageIndex) => (
                      <div
                        key={`${image}-${imageIndex}`}
                        className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-[#00C896]/50 transition-all duration-200"
                        onClick={() =>
                          setPopupImage(image)
                        }
                      >
                        <img
                          src={image}
                          alt="Review"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {popupImage && (
        <div
          onClick={() => setPopupImage(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] px-4 py-6 transition-opacity duration-200"
        >
          <button
            type="button"
            onClick={() => setPopupImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors duration-200"
          >
            <FaTimes />
          </button>

          <img
            src={popupImage}
            alt="Review full"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-[500px] max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}