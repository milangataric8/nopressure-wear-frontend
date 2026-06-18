import { useState } from 'react';
import StarRating from '../common/StarRating';

const ProductReviews = ({
                            reviews,
                            isAuthenticated,
                            user,
                            myRating,
                            setMyRating,
                            myComment,
                            setMyComment,
                            submittingReview,
                            onSubmitReview,
                            onDeleteReview,
                        }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);

    const alreadyReviewed = isAuthenticated() &&
        reviews.some(r => r.userName === `${user.firstName} ${user.lastName}`);

    return (
        <div className="pb-6">
            {/* Write review */}
            {isAuthenticated() && !alreadyReviewed && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                    >
                        {showReviewForm ? '− Cancel Review' : '+ Write a Review'}
                    </button>

                    {showReviewForm && (
                        <div className="border border-gray-200 p-6 mt-3">
                            <div className="mb-3">
                                <StarRating
                                    rating={myRating}
                                    size="lg"
                                    interactive
                                    onRate={setMyRating}
                                />
                            </div>
                            <textarea
                                value={myComment}
                                onChange={(e) => setMyComment(e.target.value)}
                                placeholder="Share your experience... (optional)"
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors mb-3"
                                rows={3}
                            />
                            <button
                                onClick={onSubmitReview}
                                disabled={submittingReview || myRating === 0}
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-30"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <StarRating rating={review.rating} size="sm" />
                                    <span className="text-xs font-semibold text-black">{review.userName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                    {isAuthenticated() && review.userName === `${user.firstName} ${user.lastName}` && (
                                        <button
                                            onClick={() => onDeleteReview(review.id)}
                                            className="text-xs text-red-400 hover:text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-600">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;