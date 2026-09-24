import { useEffect, useMemo, useState } from "react";
import "./RateUs.css";

import logo from "../assets/logowhite.png";

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

function StarIcon({ filled = false, className = "" }) {
  return (
    <svg
      className={`rate-star-svg ${filled ? "filled" : ""} ${className}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.7L14.86 8.5L21.26 9.43L16.63 13.95L17.72 20.32L12 17.31L6.28 20.32L7.37 13.95L2.74 9.43L9.14 8.5L12 2.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating, size = "normal" }) {
  return (
    <div className={`rate-stars-display ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= rating} />
      ))}
    </div>
  );
}

function formatDate(dateString, language) {
  if (!dateString) return "";

  try {
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-YE" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  } catch {
    return "";
  }
}

export default function RateUs({
  language = "en",
  user,
  onRequireAuth,
}) {
  const isArabic = language === "ar";

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);

  const token = localStorage.getItem("anis_token");

  /*
   * SORT REVIEWS
   * 5 stars → 4 → 3 → 2 → 1
   */
  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
    );
  }, [reviews]);

  /*
   * GROUP TWO REVIEWS PER SLIDE
   */
  const reviewSlides = useMemo(() => {
    const slides = [];

    for (let i = 0; i < sortedReviews.length; i += 2) {
      slides.push(sortedReviews.slice(i, i + 2));
    }

    return slides;
  }, [sortedReviews]);

  /*
   * LOAD APPROVED STORE REVIEWS
   */
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);

      const response = await fetch(`${API_URL}/reviews/store`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          (isArabic
            ? "تعذر تحميل التقييمات"
            : "Failed to load reviews")
        );
      }

      const data = result?.data;

      setReviews(
        Array.isArray(data)
          ? data
          : data?.items || []
      );
    } catch (error) {
      console.error("Store reviews error:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadReviews();
  }, []);

  /*
   * RESET SLIDE WHEN REVIEWS CHANGE
   */
  useEffect(() => {
    setCurrentSlide(0);
  }, [reviewSlides.length]);

  /*
   * AUTOPLAY
   */
  useEffect(() => {
    if (reviewSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((previous) => {
        if (previous >= reviewSlides.length - 1) {
          return 0;
        }

        return previous + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [reviewSlides.length]);

  /*
   * AVERAGE RATING
   */
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const ratingText = useMemo(() => {
    if (!averageRating) return "0.0";

    return averageRating.toFixed(1);
  }, [averageRating]);

  /*
   * OPEN RATE FORM
   */
  const handleOpenForm = () => {
    if (!user || !token) {
      if (onRequireAuth) {
        onRequireAuth();
      }

      return;
    }

    setMessage("");
    setMessageType("");
    setShowForm(true);
  };

  /*
   * CLOSE FORM
   */
  const handleCloseForm = () => {
    if (submitting) return;

    setShowForm(false);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setMessage("");
    setMessageType("");
  };

  /*
   * SUBMIT STORE REVIEW
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !token) {
      if (onRequireAuth) {
        onRequireAuth();
      }

      return;
    }

    if (!rating) {
      setMessage(
        isArabic
          ? "اختر عدد النجوم أولاً."
          : "Please select a rating first."
      );

      setMessageType("error");
      return;
    }

    const cleanComment = comment.trim();

    if (!cleanComment) {
      setMessage(
        isArabic
          ? "اكتب تعليقك أولاً."
          : "Please write a comment."
      );

      setMessageType("error");
      return;
    }

    if (cleanComment.length < 3) {
      setMessage(
        isArabic
          ? "يجب أن يكون التعليق 3 أحرف على الأقل."
          : "Your comment must be at least 3 characters."
      );

      setMessageType("error");
      return;
    }

    if (cleanComment.length > 1000) {
      setMessage(
        isArabic
          ? "التعليق طويل جداً."
          : "Your comment is too long."
      );

      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/reviews/store`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment: cleanComment,
            comment_en: isArabic ? "" : cleanComment,
            comment_ar: isArabic ? cleanComment : "",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          (isArabic
            ? "تعذر إرسال التقييم."
            : "Failed to submit your review.")
        );
      }

      setShowForm(false);
      setRating(0);
      setHoverRating(0);
      setComment("");

      setMessage(
        isArabic
          ? "تم إرسال تقييمك بنجاح! سيظهر بعد موافقة الإدارة."
          : "Your review was submitted! It will appear after admin approval."
      );

      setMessageType("success");

      await loadReviews();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (error) {
      console.error(
        "Submit store review error:",
        error
      );

      setMessage(
        error.message ||
        (isArabic
          ? "حدث خطأ أثناء إرسال التقييم."
          : "Something went wrong while submitting your review.")
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleRating =
    hoverRating || rating;

  /*
   * COMMENT LANGUAGE
   */
  const getComment = (review) => {
    if (isArabic) {
      return (
        review.comment_ar ||
        review.comment_en ||
        review.comment ||
        ""
      );
    }

    return (
      review.comment_en ||
      review.comment_ar ||
      review.comment ||
      ""
    );
  };

  /*
   * NEXT / PREVIOUS
   */
  const nextSlide = () => {
    if (!reviewSlides.length) return;

    setCurrentSlide((previous) =>
      previous >= reviewSlides.length - 1
        ? 0
        : previous + 1
    );
  };

  const previousSlide = () => {
    if (!reviewSlides.length) return;

    setCurrentSlide((previous) =>
      previous <= 0
        ? reviewSlides.length - 1
        : previous - 1
    );
  };

  return (
    <section
      className={`rate-us-section ${isArabic ? "rtl" : "ltr"
        }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="rate-us-container">

        {/* HEADER */}

        <div className="rate-us-header">
          <div className="rate-us-eyebrow">
            {isArabic
              ? "آراء عملائنا"
              : "CUSTOMER VOICES"}
          </div>

          <h2>
            {isArabic
              ? "رأيك يهمنا"
              : "Your Experience Matters"}
          </h2>

          <p>
            {isArabic
              ? "شاركنا تجربتك وساعدنا على تقديم خدمة أفضل دائماً."
              : "Share your experience and help us make our service even better."}
          </p>
        </div>

        {/* MAIN RATING CARD */}

        <div className="rate-us-main-card">
          <div className="rate-us-main-content">

            <div className="rate-us-rating-summary">
              <div className="rate-us-average">
                {ratingText}
              </div>

              <Stars
                rating={Math.round(
                  averageRating
                )}
                size="large"
              />

              <div className="rate-us-total">
                {reviews.length === 1
                  ? isArabic
                    ? "تقييم واحد"
                    : "1 review"
                  : isArabic
                    ? `${reviews.length} تقييمات`
                    : `${reviews.length} reviews`}
              </div>
            </div>

            <div className="rate-us-divider" />

            <div className="rate-us-cta">

              <div className="rate-us-cta-icon">
                <img src={logo} alt="Anis Phone" />
              </div>

              <div className="rate-us-cta-copy">
                <h3>
                  {isArabic
                    ? "كيف كانت تجربتك معنا؟"
                    : "How was your experience?"}
                </h3>

                <p>
                  {isArabic
                    ? "قيّم متجرنا وأخبرنا برأيك."
                    : "Rate our store and tell us what you think."}
                </p>
              </div>

              <button
                type="button"
                className="rate-us-button"
                onClick={handleOpenForm}
              >
                <span>
                  {isArabic
                    ? "قيّمنا الآن"
                    : "Rate Us"}
                </span>

                <span className="rate-us-button-arrow">
                  {isArabic ? "←" : "→"}
                </span>
              </button>

            </div>
          </div>

          {message && !showForm && (
            <div
              className={`rate-us-message ${messageType}`}
            >
              <span className="rate-us-message-icon">
                {messageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              <span>{message}</span>
            </div>
          )}
        </div>

        {/* REVIEW FORM */}

        {showForm && (
          <div className="rate-us-form-card">

            <div className="rate-us-form-header">

              <div>
                <span className="rate-us-form-label">
                  {isArabic
                    ? "تقييم المتجر"
                    : "STORE REVIEW"}
                </span>

                <h3>
                  {isArabic
                    ? "شاركنا رأيك"
                    : "Tell us what you think"}
                </h3>
              </div>

              <button
                type="button"
                className="rate-us-close"
                onClick={handleCloseForm}
                disabled={submitting}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* STAR SELECTOR */}

              <div className="rate-us-form-rating">

                <span>
                  {isArabic
                    ? "كيف تقيّم تجربتك؟"
                    : "How would you rate your experience?"}
                </span>

                <div
                  className="rate-us-interactive-stars"
                  onMouseLeave={() =>
                    setHoverRating(0)
                  }
                >
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className={`interactive-star ${star <= visibleRating
                          ? "active"
                          : ""
                          }`}
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        onFocus={() =>
                          setHoverRating(star)
                        }
                        onClick={() =>
                          setRating(star)
                        }
                        aria-label={`${star} stars`}
                      >
                        <StarIcon
                          filled={
                            star <=
                            visibleRating
                          }
                        />
                      </button>
                    )
                  )}
                </div>

                <div className="rate-us-rating-label">
                  {visibleRating === 0
                    ? isArabic
                      ? "اختر تقييمك"
                      : "Select your rating"
                    : visibleRating === 1
                      ? isArabic
                        ? "سيئ"
                        : "Poor"
                      : visibleRating === 2
                        ? isArabic
                          ? "مقبول"
                          : "Fair"
                        : visibleRating === 3
                          ? isArabic
                            ? "جيد"
                            : "Good"
                          : visibleRating === 4
                            ? isArabic
                              ? "جيد جداً"
                              : "Very Good"
                            : isArabic
                              ? "ممتاز"
                              : "Excellent"}
                </div>

              </div>

              {/* COMMENT */}

              <div className="rate-us-form-field">

                <div className="rate-us-field-heading">

                  <label htmlFor="store-review-comment">
                    {isArabic
                      ? "تعليقك"
                      : "Your comment"}
                  </label>

                  <span>
                    {comment.length}/1000
                  </span>

                </div>

                <textarea
                  id="store-review-comment"
                  value={comment}
                  maxLength={1000}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  placeholder={
                    isArabic
                      ? "اكتب تجربتك معنا..."
                      : "Tell us about your experience..."
                  }
                  disabled={submitting}
                />

              </div>

              {/* FORM MESSAGE */}

              {message && (
                <div
                  className={`rate-us-message ${messageType}`}
                >
                  <span className="rate-us-message-icon">
                    {messageType === "success"
                      ? "✓"
                      : "!"}
                  </span>

                  <span>{message}</span>
                </div>
              )}

              {/* ACTIONS */}

              <div className="rate-us-form-actions">

                <button
                  type="button"
                  className="rate-us-cancel"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  {isArabic
                    ? "إلغاء"
                    : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="rate-us-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="rate-us-spinner" />

                      {isArabic
                        ? "جاري الإرسال..."
                        : "Submitting..."}
                    </>
                  ) : (
                    <>
                      {isArabic
                        ? "إرسال التقييم"
                        : "Submit Review"}

                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* CUSTOMER REVIEWS */}

        <div className="rate-us-reviews">

          <div className="rate-us-reviews-heading">

            <div>
              <span className="rate-us-form-label">
                {isArabic
                  ? "تقييمات العملاء"
                  : "CUSTOMER REVIEWS"}
              </span>

              <h3>
                {isArabic
                  ? "ماذا يقول عملاؤنا؟"
                  : "What our customers say"}
              </h3>
            </div>

            {reviewSlides.length > 1 && (
              <div className="rate-us-carousel-controls">

                <button
                  type="button"
                  onClick={previousSlide}
                  aria-label="Previous review"
                >
                  {isArabic ? "→" : "←"}
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next review"
                >
                  {isArabic ? "←" : "→"}
                </button>

              </div>
            )}

          </div>

          <div className="rate-us-carousel">

            {loadingReviews ? (

              <div className="rate-us-loading">

                <span className="rate-us-spinner dark" />

                <span>
                  {isArabic
                    ? "جاري تحميل التقييمات..."
                    : "Loading reviews..."}
                </span>

              </div>

            ) : reviews.length === 0 ? (

              <div className="rate-us-empty">

                <div className="rate-us-empty-stars">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>

                <h4>
                  {isArabic
                    ? "كن أول من يشارك رأيه"
                    : "Be the first to share your experience"}
                </h4>

                <p>
                  {isArabic
                    ? "تقييمك يمكن أن يساعد عملاءنا الآخرين."
                    : "Your review can help other customers."}
                </p>

              </div>

            ) : (

              <div
                className="rate-us-carousel-track"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >

                {reviewSlides.map(
                  (slide, slideIndex) => (

                    <div
                      className="rate-us-carousel-slide"
                      key={`slide-${slideIndex}`}
                    >

                      {slide.map((review) => (

                        <article
                          className="rate-us-review-card"
                          key={review.id}
                        >

                          <div className="rate-us-review-top">

                            <Stars
                              rating={Number(
                                review.rating || 0
                              )}
                            />

                            <span className="rate-us-review-date">
                              {formatDate(
                                review.created_at,
                                language
                              )}
                            </span>

                          </div>

                          <div className="rate-us-quote">
                            “
                          </div>

                          <p
                            className="rate-us-review-comment"
                            lang={/[\u0600-\u06FF]/.test(getComment(review)) ? "ar" : "en"}
                          >
                            {getComment(review)}
                          </p>

                          <div className="rate-us-review-user">

                            <div className="rate-us-user-avatar">
                              {(
                                review.user_name ||
                                review.name ||
                                "C"
                              )[0].toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {review.user_name ||
                                  review.name ||
                                  (isArabic
                                    ? "عميل"
                                    : "Customer")}
                              </strong>

                              <span>
                                {isArabic
                                  ? "عميل موثّق"
                                  : "Verified Customer"}
                              </span>

                            </div>

                          </div>

                        </article>

                      ))}

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* DOTS */}

          {reviewSlides.length > 1 && (
            <div className="rate-us-dots">
              {reviewSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`rate-us-dot ${index ===
                    (isArabic
                      ? reviewSlides.length - 1 - currentSlide
                      : currentSlide)
                    ? "active"
                    : ""
                    }`}
                  onClick={() =>
                    setCurrentSlide(
                      isArabic
                        ? reviewSlides.length - 1 - index
                        : index
                    )
                  }
                  aria-label={`${index + 1}`}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}