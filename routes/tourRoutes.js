const express = require('express');
const tourController = require('./../controllers/tourControllers');
const router = express.Router();
const authControllers=require('./../controllers/authControllers')

//param middleware only run for tour toutes.e
// : /api/v1/tours/:id
//router.param('id',tourController.checkID);

// : /api/v1/tours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/top-5-expensive')
  .get(tourController.aliasTopExpensiveTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authControllers.protect,tourController.getAllTours)
  .post(tourController.createTour);

//ROUTE: /api/v1/tours/:id
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
