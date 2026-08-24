import { API_BASE_URL } from "../../config/api";
import { useState } from "react";
import { FaStar, FaImage, FaTimes, FaPen } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = `${API_BASE_URL}/api`;

function getCurrentUser() {
  const stored =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
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

export default function TransportReviews({
  vehicleId,
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

  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email || null;

  const myReview = reviews.find(
    (r) => r.email === currentUserEmail && currentUserEmail !== null
  );

  const otherReviews = reviews.filter(
    (r) => !(myReview && r._id === myReview._id)
  );

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    if (reviewImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);

    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append("photo", file);

      return axios.post(
        `${API_BASE}/transport/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });

    Promise.all(uploadPromises)
      .then((responses) => {
        const urls = responses.map((res) => res.data.url);

        setReviewImages((prev) => [...prev, ...urls]);
      })
      .catch((error) => {
        console.error(error);
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
    if (
      !window.confirm(
        "Are you sure you want to delete your review?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/transport-review/${myReview._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: currentUserEmail,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("failed");
      }

      onReviewDeleted(myReview._id);

      toast.success("Review deleted successfully");
    } catch (err) {
      toast.error("Review delete failed");
    }
  }

  async function submitReview() {
    if (!currentUser) {
      toast.error("Please log in to leave a review");
      return;
    }

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
        ? `${API_BASE}/transport-review/${myReview._id}`
        : `${API_BASE}/transport-review/create`;

      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          email: currentUser.email,
          firstName: currentUser.firstName,
          rating: reviewRating,
          comment: reviewComment,
          images: reviewImages,
          profileImage: currentUser.image,
        }),
      });

      if (!res.ok) {
        throw new Error("failed");
      }

      const data = await res.json();

      const savedReview = isUpdate
        ? data
        : data.review;

      onReviewAdded(savedReview, isUpdate);

      cancelEditReview();

      toast.success(
        isUpdate
          ? "Review updated successfully"
          : "Review added successfully"
      );
    } catch (err) {
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
    <div className="mt-8 sm:mt-10 w-full min-w-0">
      <h2 className="text-white font-bold text-[20px] sm:text-[22px] mb-4">
        Reviews
      </h2>

      {/* Review Form / My Review */}
      {currentUser && (
        <div className="bg-[#1B2B34] rounded-[16px] sm:rounded-[18px] p-4 sm:p-5 mb-5 border border-white/10 w-full min-w-0">
          {showForm ? (
            <>
              <p className="text-gray-300 text-[13px] sm:text-sm mb-2.5">
                {isEditing
                  ? "Edit your review"
                  : "Write a review"}
              </p>

              {/* Rating */}
              <div className="flex gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar
                    key={n}
                    onClick={() => setReviewRating(n)}
                    className={`cursor-pointer text-[17px] sm:text-[18px] ${
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
                onChange={(e) =>
                  setReviewComment(e.target.value)
                }
                placeholder="Share your experience with this vehicle"
                className="w-full bg-[#4A5C6A80] text-white text-[13px] rounded-[10px] p-3 outline-none resize-none placeholder:text-gray-400"
                rows={4}
              />

              {/* Images */}
              <div className="flex flex-wrap gap-2.5 mt-3">
                {reviewImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-[58px] h-[58px] sm:w-[60px] sm:h-[60px] shrink-0"
                  >
                    <img
                      src={url}
                      alt="review"
                      className="w-full h-full object-cover rounded-[8px]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeReviewImage(index)
                      }
                      className="absolute -top-2 -right-2 bg-[#CD2F31] rounded-full w-[18px] h-[18px] flex items-center justify-center text-white text-[9px]"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                {reviewImages.length < 5 && (
                  <label className="w-[58px] h-[58px] sm:w-[60px] sm:h-[60px] rounded-[8px] border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300 shrink-0">
                    {uploadingImage ? (
                      <span className="text-[11px]">
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

              {/* Buttons */}
              <div className="flex flex-wrap gap-2.5 mt-5">
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="bg-[#00C896] hover:bg-[#00b383] text-white px-4 sm:px-[18px] py-2 rounded-full text-[12px] sm:text-[13px] disabled:opacity-50 transition"
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
                    className="text-gray-300 px-4 sm:px-[18px] py-2 rounded-full text-[12px] sm:text-[13px] border border-[#4A5C6A] hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* My Review Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <p className="text-gray-300 text-[13px]">
                  Your review
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={startEditReview}
                    className="flex items-center gap-1 text-[#00C896] text-[12px] cursor-pointer"
                  >
                    <FaPen size={11} />
                    Edit
                  </button>

                  <button
                    onClick={handleDeleteReview}
                    className="flex items-center gap-1 text-[#CD2F31] text-[12px] cursor-pointer"
                  >
                    <FaTimes size={11} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar
                    key={n}
                    className={`text-[14px] ${
                      n <= myReview.rating
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-300 text-[13px] leading-relaxed break-words">
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
                      className="w-[58px] h-[58px] sm:w-[60px] sm:h-[60px] object-cover rounded-[8px] cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Other Reviews */}
      {otherReviews.length === 0 ? (
        myReview ? null : (
          <p className="text-gray-400 text-[13px] sm:text-[14px]">
            No reviews yet. Be the first to review this vehicle!
          </p>
        )
      ) : (
        <div className="space-y-3">
          {otherReviews.map((r, i) => (
            <div
              key={r._id || i}
              className="bg-[#1B2B34] rounded-[14px] sm:rounded-[16px] p-4 border border-white/10 w-full min-w-0"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {r.profileImage ? (
                    <img
                      src={r.profileImage}
                      alt={r.firstName}
                      className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] font-bold text-[15px] sm:text-[16px] shrink-0">
                      {(r.firstName || "T")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <span className="text-white font-bold text-[14px] sm:text-[16px] truncate">
                    {r.firstName || "Traveler"}
                  </span>
                </div>

                {/* Rating / Time */}
                <div className="flex flex-col sm:flex-row sm:items-center items-end gap-1 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <FaStar className="text-yellow-400 text-[13px] sm:text-[14px]" />

                    <span className="text-gray-300 text-[12px] sm:text-[13px]">
                      {r.rating.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-gray-500 text-[10px] sm:text-[12px]">
                    {timeAgo(r.date)}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-300 text-[12px] sm:text-[13px] mt-3 leading-relaxed break-words">
                {r.comment}
              </p>

              {/* Review Images */}
              {r.images?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="review"
                      onClick={() => setPopupImage(img)}
                      className="w-[58px] h-[58px] sm:w-[60px] sm:h-[60px] object-cover rounded-[8px] cursor-pointer"
                    />
                  ))}
                </div>
              )}
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
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white text-[20px] sm:text-[22px] p-2"
          >
            <FaTimes />
          </button>

          <img
            src={popupImage}
            alt="review full"
            onClick={(e) => e.stopPropagation()}
            className="w-auto max-w-full max-h-[80vh] sm:max-w-[500px] rounded-[12px] object-contain"
          />
        </div>
      )}
    </div>
  );
}