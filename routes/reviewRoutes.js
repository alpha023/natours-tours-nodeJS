const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authControllers = require('./../controllers/authControllers');

const router = express.Router({mergeParams:true});// only in case of nested routes
//POST /tour/64guefguyg376tr76rt3/reviews
//GET /tour/64guefguyg376tr76rt3/reviews
// POST /reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControllers.protect,
    authControllers.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
