const express = require('express');
const reviewControllers = require('./../controllers/reviewController');
const authControllers = require('./../controllers/authControllers');

const router = express.Router({ mergeParams: true }); // only in case of nested routes
//POST /tour/64guefguyg376tr76rt3/reviews
//GET /tour/64guefguyg376tr76rt3/reviews
// POST /reviews

router.use(authControllers.protect);
router
  .route('/')
  .get(reviewControllers.getAllReviews)
  .post(
    authControllers.protect,
    authControllers.restrictTo('user'),
    reviewControllers.setTourUserIds,
    reviewControllers.createReview
  );

router
  .route('/:id')
  .get(reviewControllers.getReview)
  .patch(
    authControllers.restrictTo('user', 'admin'),
    reviewControllers.updateReview
  )
  .delete(
    authControllers.restrictTo('user', 'admin'),
    reviewControllers.deleteReview
  );

module.exports = router;
