const express = require('express');
const tourController = require('./../controllers/tourControllers');
const router = express.Router();
const authControllers = require('./../controllers/authControllers');
const reviewRouter = require('./../routes/reviewRoutes');

//param middleware only run for tour toutes.e
// : /api/v1/tours/:id
//router.param('id',tourController.checkID);

//Nested Route
//POST /tour/32uehfuefuyegfe5wegwugfTOURID4d/review
//GET /tour/4683hegfhegfehf48743trhegf/review
//nested ROUTE

//Confusing that is review route inside the TourRouter
// express gives more convenient way to create a NestedRoute
//using advance express feature that is merge params
// router
// .route('/:tourId/reviews')
// .post(
//   authControllers.protect,
//   authControllers.restrictTo('user'),
//   reviewControllers.createReview
// );

//

router.use('/:tourId/reviews', reviewRouter);

// : /api/v1/tours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/top-5-expensive')
  .get(tourController.aliasTopExpensiveTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//optional way of above using a query string
//tours-distance?distance=233&center=40&unit=mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

//ROUTE: /api/v1/tours/:id
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
