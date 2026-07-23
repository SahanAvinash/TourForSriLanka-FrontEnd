import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FaStar, FaRegStar, FaSearch, FaUser
} from "react-icons/fa";

export default function Reviews() {
    const [hotelId, setHotelId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        setHotelId(user._id);
    }, []);

    useEffect(() => {
        if (hotelId) fetchReviews();
    }, [hotelId]);

    function fetchReviews() {
        setLoadingReviews(true);
        axios.get(`http://localhost:3000/api/reviews/hotel/${hotelId}`)
            .then((res) => {
                setReviews(res.data);
            }).catch((error) => {
                console.log(error);
                toast.error("Failed to load reviews");
            }).finally(() => {
                setLoadingReviews(false);
            });
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString("en-US", {
            day: "2-digit", month: "short", year: "numeric"
        });
    }

    function renderStars(rating) {
        return [1, 2, 3, 4, 5].map((n) =>
            n <= Math.round(rating)
                ? <FaStar key={n} className="text-[#E8A33D] text-[13px]" />
                : <FaRegStar key={n} className="text-[#4A5C6A] text-[13px]" />
        );
    }

    const filteredReviews = reviews.filter((r) => {
        const name = r.firstName?.toLowerCase() || "";
        const comment = r.comment?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return name.includes(term) || comment.includes(term);
    });

    const totalReviews = reviews.length;
    const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length
    }));

    return (
        <section id="reviews" className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[#CCD0CF] text-[24px] font-bold">Reviews</h1>
            </div>

            {!loadingReviews && totalReviews > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
                    <div className="bg-[#253745] rounded-[24px] p-8 flex flex-col justify-center">
                        <p className="text-[#CCD0CF]/60 text-[15px] mb-3">Average Rating</p>
                        <p className="text-[#CCD0CF] text-[64px] font-bold leading-none">{averageRating}</p>
                        <div className="flex gap-2 mt-4">{renderStars(averageRating)}</div>
                        <p className="text-[#CCD0CF]/50 text-[13px] mt-3">
                            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                        </p>
                    </div>

                    <div className="bg-[#253745] rounded-[24px] p-8 flex flex-col justify-center">
                        <p className="text-[#CCD0CF]/60 text-[15px] mb-3">Total Reviews</p>
                        <p className="text-[#CCD0CF] text-[64px] font-bold leading-none">{totalReviews}</p>
                        <p className="text-[#CCD0CF]/50 text-[13px] mt-4">
                            {ratingCounts[0].count} five-star {ratingCounts[0].count === 1 ? "review" : "reviews"}
                        </p>
                    </div>

                    <div className="bg-[#253745] rounded-[24px] p-8">
                        <p className="text-[#CCD0CF]/60 text-[15px] mb-4">Rating Breakdown</p>
                        <div className="space-y-2.5">
                            {ratingCounts.map(({ star, count }) => (
                                <div key={star} className="flex items-center gap-3 text-[13px]">
                                    <span className="text-[#CCD0CF]/60 w-[10px]">{star}</span>
                                    <FaStar className="text-[#E8A33D] text-[12px]" />
                                    <div className="flex-1 h-[8px] bg-[#4A5C6A]/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00C896]"
                                            style={{ width: totalReviews ? `${(count / totalReviews) * 100}%` : "0%" }}
                                        ></div>
                                    </div>
                                    <span className="text-[#CCD0CF]/60 w-[18px] text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#253745] rounded-[20px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#CCD0CF] text-[20px] font-bold">All Reviews</h2>
                    <div className="relative w-[280px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by guest or keyword"
                            className="w-full h-[42px] bg-[#4A5C6A]/50 rounded-[20px] pl-[16px] pr-[40px] text-[#CCD0CF] text-[13px] outline-none"
                        />
                        <FaSearch className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
                    </div>
                </div>

                {loadingReviews ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">Loading reviews...</p>
                ) : filteredReviews.length === 0 ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">No reviews found.</p>
                ) : (
                    <div>
                        <div className="space-y-4">
                            {visibleReviews.map((review, index) => (
                                <div
                                    key={review._id}
                                    className={`pt-4 ${index === 0 ? "" : "border-t border-[#4A5C6A]/40"}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-[45px] h-[45px] rounded-full bg-[#1B2B34] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {review.profileImage ? (
                                                <img
                                                    src={review.profileImage}
                                                    alt={review.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaUser className="text-[#4A5C6A] text-[16px]" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[#CCD0CF] font-bold text-[14px]">{review.firstName}</p>
                                                <p className="text-[#CCD0CF]/60 text-[12px]">{formatDate(review.date)}</p>
                                            </div>
                                            <div className="flex gap-1 my-1">{renderStars(review.rating)}</div>
                                            <p className="text-[#CCD0CF]/80 text-[13px] leading-relaxed">{review.comment}</p>
                                            {review.images?.length > 0 && (
                                                <div className="flex gap-2 mt-3">
                                                    {review.images.map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img}
                                                            alt={`review-${i}`}
                                                            className="w-[60px] h-[60px] rounded-[10px] object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredReviews.length > 5 && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="h-[42px] px-6 rounded-[20px] bg-[#4A5C6A]/50 text-[#00C896] text-[13px] font-bold hover:bg-[#4A5C6A]/70 cursor-pointer"
                                >
                                    {showAll ? "Show Less" : `View All Reviews (${filteredReviews.length})`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
