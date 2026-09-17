const model = require("../models/reviewModel");
const { success, created } = require("../utils/response");

async function list(req, res) {
  return success(
    res,
    await model.listForProduct(req.params.productId)
  );
}

async function create(req, res) {
  const rating = Number(req.body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be an integer from 1 to 5."
    });
  }

  return created(
    res,
    await model.create(req.user.id, {
      ...req.body,
      rating,
      product_id: req.params.productId
    })
  );
}

/*
 * STORE REVIEW
 */

async function listStore(req, res) {
  return success(
    res,
    await model.listStoreReviews(true)
  );
}

async function createStore(req, res) {
  const rating = Number(req.body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be an integer from 1 to 5."
    });
  }

  const commentAr =
    typeof req.body.comment_ar === "string"
      ? req.body.comment_ar.trim()
      : null;

  const commentEn =
    typeof req.body.comment_en === "string"
      ? req.body.comment_en.trim()
      : null;

  const genericComment =
    typeof req.body.comment === "string"
      ? req.body.comment.trim()
      : null;

  const finalCommentAr = commentAr || genericComment;
  const finalCommentEn = commentEn || genericComment;

  if (!finalCommentAr && !finalCommentEn) {
    return res.status(400).json({
      success: false,
      message: "Comment is required."
    });
  }

  if (
    (finalCommentAr && finalCommentAr.length > 1000) ||
    (finalCommentEn && finalCommentEn.length > 1000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Comment must not exceed 1000 characters."
    });
  }

  const review = await model.createStoreReview(req.user.id, {
    rating,
    comment_ar: finalCommentAr,
    comment_en: finalCommentEn
  });

  return created(res, review);
}

async function myStoreReview(req, res) {
  return success(
    res,
    await model.getUserStoreReview(req.user.id)
  );
}

async function storeStats(req, res) {
  return success(
    res,
    await model.getStoreStats()
  );
}

async function all(req, res) {
  return success(
    res,
    await model.listAll()
  );
}

async function approve(req, res) {
  const approved =
    (req.body.is_approved ?? req.body.approved) !== false;

  const review = await model.approve(
    req.params.id,
    approved
  );

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found."
    });
  }

  return success(res, review);
}

module.exports = {
  list,
  create,
  listStore,
  createStore,
  myStoreReview,
  storeStats,
  all,
  approve
};