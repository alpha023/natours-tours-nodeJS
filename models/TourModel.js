const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./UserModel');
const validator = require('validator');
const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must Have Name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must not exceed 40 chars'],
      minLength: [10, 'A tour name must have min 10 chars'],
      // validate:[validator.isAlpha,'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Dfficulty is either : easy || medium || difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be abouve 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (priceDiscountValue) {
          //this only points to current document creation not updation
          return priceDiscountValue < this.price;
        },
        message: 'Discount price (${VALUE}) should be below the regular Price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a Cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //Geo JSon To Specify The Latitudes And The Longitudes On The Earth
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],

    //Child Referncing avoid it as a single tour may have too too many reviews then this array will grow too much
    // reviews:[
    //   {
    //     type:mongoose.Schema.ObjectId,
    //     ref:'Review'
    //   }
    // ]
  },
  //options other than schema
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//VIRTUAL POPULATE
TourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
});
//durationWeeks cant be use in our DB query Because this is not a part of our DB

//DOCUMENT MIDDLEWARE - it runs before .save() cmd and .create()
//right before we actually save it in the db
// : --pre-save hook
//can have multiple pre-hook
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//EMBEDDING THE TOURS
// TourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

//REFERENCING CHILD PARENT RELATION

//after all pre middlewares is executed
TourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
//==================
//02:)-QUERY-MIDDLEWARE
//-pre-find hook
//executed before a find() query is going to execute
//before await queryObject this is executed then data will get
//    /^find/ this is regex all cmds havinf find
TourSchema.pre(/^find/, function (next) {
  //this is current query object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

TourSchema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt'
  });

  next();
});
// TourSchema.pre('findOne', function (next) {
//   //this is current query object
//   this.find({ secretTour: { $ne: true } });

//   next();
// });

//it will execute after our query is already executed
TourSchema.post(/^find/, function (docs, next) {
  console.log(`Query Took ${Date.now() - this.start} millis`);
  next();
});



//===============================================
//03). AGGREGATION MIDDLEWARE
//before and after aggregation happens
TourSchema.pre('aggregate', function (next) {
  //this points to current aggregation object
  // unshift will ad this at first pos of array
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
