'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';
import Link from 'next/link';

interface ItemReview {
  menuItemId: string;
  rating: number;
  comment: string;
}

export default function ReviewPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [reviews, setReviews] = useState<ItemReview[]>([]);
  const { getOrderDetail, reviewItem } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadOrder();
    }
  }, [isAuthenticated, params.orderId, router]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError('');
      const orderData = await getOrderDetail(params.orderId);
      setOrder(orderData);

      // Initialize reviews array
      if (orderData.items) {
        setReviews(
          orderData.items.map(item => ({
            menuItemId: item.menuItemId,
            rating: 5,
            comment: '',
          }))
        );
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewChange = (
    menuItemId: string,
    field: 'rating' | 'comment',
    value: any
  ) => {
    setReviews(
      reviews.map(review =>
        review.menuItemId === menuItemId
          ? { ...review, [field]: value }
          : review
      )
    );
  };

  const handleSubmitReviews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit all reviews
      for (const review of reviews) {
        if (review.comment.trim()) {
          await reviewItem(
            params.orderId,
            review.menuItemId,
            review.rating,
            review.comment
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/orders');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Order not found'}
            </h2>
            <Link
              href="/orders"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You for Your Review!
            </h2>
            <p className="text-gray-600 mb-8">
              Your feedback helps us improve our service.
            </p>
            <Link
              href="/orders"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block">
            ← Back to Order
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⭐ Review Your Order
          </h1>
          <p className="text-gray-600">
            Please rate your experience and share your feedback
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmitReviews} className="bg-white rounded-lg shadow p-8 space-y-8">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const review = reviews.find(r => r.menuItemId === item.menuItemId);

              return (
                <div key={item.menuItemId} className="pb-8 border-b last:border-b-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Item {index + 1}
                  </h2>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-3">
                      ⭐ How would you rate this item?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            handleReviewChange(item.menuItemId, 'rating', star)
                          }
                          className={`text-4xl transition ${
                            (review?.rating || 0) >= star
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      Rating: {review?.rating || 0} / 5
                    </p>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      📝 Additional Comments (Optional)
                    </label>
                    <textarea
                      value={review?.comment || ''}
                      onChange={(e) =>
                        handleReviewChange(
                          item.menuItemId,
                          'comment',
                          e.target.value
                        )
                      }
                      placeholder="Share your thoughts about this item..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-gray-600 text-sm mt-1">
                      {(review?.comment || '').length}/500 characters
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-600">No items to review</p>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 border border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition text-center"
            >
              ← Back to Order
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? '⏳ Submitting...' : '✅ Submit Reviews'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}