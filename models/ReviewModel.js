// review / rating /createdAt /ref to user / ref to tour
const mongoose = require('mongoose');
const Tour = require('./TourModel');
const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be Empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review Must Belong To A Tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must Belong to a User.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({tour:1,user:1},{unique:true});

//Pre find Query Middleware
ReviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //     path:'tour',
  //     select:'name'
  // }).populate({
  //     path:'user',
  //     select:'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//We use Parent referncing for the Reviews model
//that is Parent||Tour ko apne reviews k baare me nhi pata h
//but each review has its parent info

//SOLUTION : Virtual Populate

//STATIC METHODS ON THE MODEL
ReviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  }else{
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity:0,
        ratingsAverage:4.5,
      });
  }
};

ReviewSchema.post('save', function () {
  //this points to current review
  // Review.calcAverageRatings(this.tour);
  //post middlewares dont have access to the next function
  this.constructor.calcAverageRatings(this.tour);
  //   next();
});

//Error When UPDATING A REVIEW --Calc Average rating On Tours Part 02
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(r);
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // this.r=await this.findOne();  --this wont be work here because the query is already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;

//POST /tour/32uehfuefuyegfe5wegwugfTOURID4d/review
//GET /tour/4683hegfhegfehf48743trhegf/review
//nested ROUTE
