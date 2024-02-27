const Review = require('./../models/ReviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews=factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

//CREATE A NEW REVIEW ==setting up the middle ware which takes care some additiional code apart from the creating a review
exports.setTourUserIds = (req, res, next) => {
  //Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  //
  next();
};
exports.createReview=factory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   // //Allow Nested Routes
//   // if (!req.body.tour) req.body.tour = req.params.tourId;
//   // if (!req.body.user) req.body.user = req.user.id;
//   //
//   const newReview = await Review.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       newReview,
//     },
//   });
// });

//DELETING A REVIEW
exports.deleteReview = factory.deleteOne(Review);

//UPDATING A REVIEW
exports.updateReview = factory.updateOne(Review);

//
exports.getReview=factory.getOne(Review);
