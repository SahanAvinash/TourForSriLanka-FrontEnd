import { useState } from "react";
import { FaStar, FaImage, FaTimes, FaPen } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}
function getCurrentUserEmail() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded?.email || null
  } catch {
    return null;
  }
}
function getReviewOwnerId(review) {
  return review.email || null;
}
function timeAgo(dateString){
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)
    if(seconds < 60) return "Just Now"

    const minutes = Math.floor(seconds / 60)
    if(minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""}`

    const hours = Math.floor(minutes / 60)
    if(hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`

    const years = Math.floor(months /12)
    return `${years} year${years > 1 ? "s" : ""} ago`
}
export default function HotelReviews({ hotelId, reviews, onReviewAdded, onReviewDeleted }) {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  const currentUserEmail = getCurrentUserEmail();
  const myReview = reviews.find((r) => getReviewOwnerId(r) === currentUserEmail && currentUserEmail !== null);
  const otherReviews = reviews.filter((r) => !(myReview && r._id === myReview._id));

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
      return axios.post(`${API_BASE}/hotel/upload-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    });
    Promise.all(uploadPromise)
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
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
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
  async function handleDeleteReview(){
    if(!window.confirm("Are you sure want to delet your review?")) return
    try{
        const res = await fetch(`${API_BASE}/review/${currentUserEmail}`,{
            method: "DELETE",
            headers: {...getAuthHeader}
        })
        if(!res.ok) throw new Error("failed")
        onReviewDeleted(myReview._id)
        toast.success("Review deleted successfully")
    }catch(err){
        toast.error("Review delete failed")
    }
  }

  async function submitReview() {
    if (!reviewComment.trim()) {
      toast.error(isEditing ? "Failed to update review" : "Failed to submit a review");
      return;
    }
    setSubmittingReview(true);
    try {
      const isUpdate = isEditing && myReview;
      const url = isUpdate ? `${API_BASE}/review/${myReview._id}` : `${API_BASE}/review`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({
          hotelId,
          rating: reviewRating,
          comment: reviewComment,
          images: reviewImages
        })
      });
      if (!res.ok) throw new Error("failed");
      const savedReview = await res.json();
      onReviewAdded(savedReview, isUpdate);

      cancelEditReview();
      toast.success(isUpdate ? "Review updated successfully" : "Review added successfully");
    } catch (err) {
      toast.error(isEditing ? "Review update failed" : "Review submit failed");
    } finally {
      setSubmittingReview(false);
    }
  }

  const showForm = !myReview || isEditing;

  return (
    <div className="mt-[40px]">
      <h2 className="text-white font-bold text-[20px] mb-[16px]">Reviews</h2>

      <div className="bg-[#253745] rounded-[18px] p-[20px] mb-[20px]">
        {showForm ? (
          <>
            <p className="text-gray-300 text-[13px] mb-[10px]">
              {isEditing ? "Edit your review" : "Write a review"}
            </p>
            <div className="flex gap-[6px] mb-[10px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar
                  key={n}
                  onClick={() => setReviewRating(n)}
                  className={`cursor-pointer text-[18px] ${n <= reviewRating ? "text-yellow-400" : "text-gray-600"}`}
                />
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share Your Experience"
              className="w-full bg-[#1a2530] text-white text-[13px] rounded-[10px] p-[12px] outline-none resize-none"
              rows={3}
            />
            <div className="flex flex-wrap gap-[10px] mt-[10px]">
              {reviewImages.map((url, index) => (
                <div key={index} className="relative w-[60px] h-[60px]">
                  <img src={url} alt="review" className="w-full h-full object-cover rounded-[8px]" />
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
                <label className="w-[60px] h-[60px] rounded-[8px] border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300">
                  {uploadingImage ? "..." : <FaImage size={18} />}
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
            <div className="flex gap-[10px] mt-[20px]">
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="bg-[#00C896] text-white px-[18px] py-[8px] rounded-full text-[13px] disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
              </button>
              {isEditing && (
                <button
                  onClick={cancelEditReview}
                  disabled={submittingReview}
                  className="text-gray-300 px-[18px] py-[8px] rounded-full text-[13px] border border-[#4A5C6A]"
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-[10px]">
              <p className="text-gray-300 text-[13px]">Your review</p>
              <div className="flex items-center gap-[14px]">
                <button
                    onClick={startEditReview}
                    className="flex items-center gap-[4px] text-[#00C896] text-[12px] shrink-0 whitespace-nowrap cursor-pointer"
                >
                    <FaPen size={11} /> Edit
                </button>
                <button
                    onClick={handleDeleteReview}
                    className="flex items-center gap-[4px] text-[#CD2F31] text-[12px] shrink-0 whitespace-nowrap cursor-pointer"
                >
                    <FaTimes size={11} />Delete
                </button>
                </div>
            </div>
            <div className="flex gap-[2px] mb-[8px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar key={n} className={`text-[14px] ${n <= myReview.rating ? "text-yellow-400" : "text-gray-600"}`} />
              ))}
            </div>
            <p className="text-gray-300 text-[13px]">{myReview.comment}</p>
            {myReview.images?.length > 0 && (
              <div className="flex gap-[8px] mt-[10px] flex-wrap">
                {myReview.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="review"
                    onClick={() => setPopupImage(img)}
                    className="w-[60px] h-[60px] object-cover rounded-[8px] cursor-pointer"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {otherReviews.length === 0 ? (
        myReview ? null : <p className="text-gray-400 text-[14px]">No any reviews</p>
      ) : (
        <div className="space-y-[12px]">
          {otherReviews.map((r, i) => (
  <div key={r._id || i} className="bg-[#253745] rounded-[14px] p-[16px]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-[12px]">
        <div className="w-[42px] h-[42px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] font-bold text-[16px] shrink-0">
          {r.profileImage ? (
            <img
                src={r.profileImage}
                alt={r.firstName}
                className="w-[42px] h-[42px] rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-[42px] h-[42px] rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] font-bold text-[16px] shrink-0">
                {(r.firstName || "T").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-white font-bold text-[16px]">{r.firstName || "Traveler"}</span>
      </div>
      <div className="flex items-center gap-[8px] shrink-0">
        <FaStar className="text-yellow-400 text-[14px]" />
        <span className="text-gray-300 text-[13px]">{r.rating.toFixed(1)}</span>
        <span className="text-gray-500 text-[12px]">{timeAgo(r.date)}</span>
      </div>
    </div>
    <p className="text-gray-300 text-[13px] mt-[12px] leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {popupImage && (
        <div
          onClick={() => setPopupImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-[16px]"
        >
          <button
            onClick={() => setPopupImage(null)}
            className="absolute top-[20px] right-[20px] text-white text-[22px]"
          >
            <FaTimes />
          </button>
          <img
            src={popupImage}
            alt="review full"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[500px] max-h-[500px] rounded-[12px] object-contain"
          />
        </div>
      )}
    </div>
  );
}
