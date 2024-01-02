// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const User = require('./../models/UserModel');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const util = require('util');

// const signInToken = (id) => {
//   return jwt.sign(
//     { id: id }, //payload
//     process.env.JWT_SECRET, //SECRET
//     { expiresIn: process.env.JWT_EXPIRES_IN } //DURATION OF TOKEN
//   );
// };

// exports.signUp = catchAsync(async (req, res, next) => {
//   const user = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//   });

//   const token = signInToken(user._id);

//   res.status(201).json({
//     status: 'success',
//     token: token,
//     data: {
//       user: user,
//     },
//   });
// });

// exports.logIn = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   //1). Check if email and password exist
//   if (!email || !password) {
//     return next(new AppError('please provide email and password!', 400));
//   }

//   //2). Check if user exists && password is correct
//   const user = await User.findOne({ email: email }).select('+password'); //to explicitly select the password field

//   if (!user || !(await user.correctPassword(password, user.password)))
//     return new AppError('Incorrect email or password', 401); //fool the hacker

//   //3). if everything is OK , send the token to client
//   const token = signInToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     token: token,
//   });
// });

// exports.protect = catchAsync(async (req, res, next) => {
//   //1). Getting token and check if it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   console.log('TOKEN :', token);
//   if (!token) return next(new AppError('Please Log In To get Access', 401));

//   //2). Verification of TOKEN
//   const decoded = await util.promisify(jwt.verify)(
//     token,
//     process.env.JWT_SECRET
//   );
//   console.log('decoded : ', decoded);

//   //3). Check if User Still Exist
//   const freshUser = await User.findById(decoded.id);
//   if (!freshUser)
//     return next(
//       new AppError('The user belonging to this token is no longer exist', 401)
//     );

//   //4). Check if user changed password after the JWT token is issued
// //   console.log('RESULT:',await freshUser.changedPasswordAfter(decoded.iat));
//   if (freshUser.changedPasswordAfter(decoded.iat))
//     return next(
//       new AppError('User recently changed password,login again', 401)
//     );

//   //everything ok then only next middleware is called
//   //GRANT ACCESS TO PROTECTED ROUTE
//   req.user=freshUser;
//   next();
// });
// //===============================================
// const AppError = require('../utils/appError');

// const sendErrorDev = (err, res) => {
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     error: err,
//     stack: err.stack,
//   });
// };
// const sendErrorProd = (err, res) => {
//   //operationalError , trusted error and send msg to client
//   if (err.isOperational) {
//     console.log(`==============`,err.message)
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//     //Programming error or other unknown error dont want to leak the details to the client
//   } else {
//     //1).Log error
//     console.error('ERROR:', err);

//     //2). send generated msg
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong',
//     });
//   }
// };
// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path} : ${err.value}`;
//   return new AppError(message, 400);
// };
// const handleDuplicateFieldsDB = (err) => {
//   // const val=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  
//   const val = err.keyValue;
//   const message = `Duplicate field value : ${Object.values(val).join(',')}`;
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   const msg = `Invalid input data. ${errors.join(', ')}`;
//   return new AppError(msg, 400);
// };
// const handleJsonWebTokenError=(err)=>{
//   return new AppError('Invalid Token, Please Login again',401);
// }
// const handleJWTExpiredError=(err)=>{
//   return new AppError('Your Token is Expired, Please Log In Again',401);
// };
// module.exports = (err, req, res, next) => {
//   console.log(`err.errors.name:`, err.message);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   // return res.status(404).json({
//   //   err:err
//   // });

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === 'production') {
//     //all props are not duplicated here
//      let error = { ...err };// -->only shallow copy not deep copy

//     //DEEP COPY
//     // let error=JSON.parse(JSON.stringify(err));
//     // let error=Object.assign(Object.create(Object.getPrototypeOf(err)),err);
//     // return (res.status(222).json({
//     //   error:err,
//     //   erro2:error
//     // }));
//     console.log(err,error)
//      console.log(`ERROR-msg : `, error.message);
//     if (error.kind === 'ObjectId') {
//       // console.log(`ERRORname : `, error.name);
//       error = handleCastErrorDB(error);
//     }
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (err.name === 'ValidationError') {
//       error = handleValidationErrorDB(error);
//     }
//     if(err.name==='JsonWebTokenError'){

//       error=handleJsonWebTokenError(error);

//     }
//     if(err.name==='TokenExpiredError')error=handleJWTExpiredError(error);

//     sendErrorProd(error, res);
//   }

//   next();
// };
// //========================
// // const fs = require('fs');
// const Tour = require('./../models/TourModel');
// const APIFeatures = require('./../utils/apiFeatures');
// const catchAsync=require('./../utils/catchAsync');
// const AppError=require('./../utils/appError');
// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// // );

// // exports.checkID = (req, res, next, val) => {
// //   if (req.params.id * 1 > tours.length) {
// //     return res.status(404).json({
// //       status: 'fail',
// //       msg: 'Invalid ID',
// //     });
// //   }
// //   next();
// // };
// exports.getAllTours = catchAsync(async (req, res,next) => {
//   // try {
//     // console.log(req.query);

//     //creating a deep-copy
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // excludedFields.forEach((el) => delete queryObj[el]);
//     // // console.log(req.query, queryObj);

//     // //02: Advance Filtering
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // console.log(JSON.parse(queryStr));

//     // //M01:To Query data
//     // let query = Tour.find(JSON.parse(queryStr));

//     //2) Sorting
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   console.log(req.query.sort, sortBy);
//     //   query = query.sort(sortBy);

//     //   //sort('price ratingsAverage')
//     // } else {
//     //   // DEfault Sorting
//     //   query = query.sort('-createdAt');
//     // }

//     //3) Field Limiting
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(',').join(' ');
//     //   query = query.select(fields);
//     // } else {
//     //   //query=query.select('name createdAt')
//     //   // minus sign indicates exclusion of such fields
//     //   query = query.select('-__v');
//     // }

//     //04.) PAGINATION
//     // page=2&limit=10, 1-10=page1,11-20=page2
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = limit * (page - 1);

//     // query = query.skip(skip).limit(limit);
//     // if (req.query.page) {
//     //   const numTours = await Tour.countDocuments();
//     //   if (skip >= numTours) {
//     //     throw new Error('This Page Does not Exist');
//     //   }
//     //   //query.sort().select().skip().limit()
//     // }
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;

//     // const tours = await query;
//     // const tours = await Tour.find(JSON.parse(queryStr));

//     //create query
//     // const query=Tour.find(queryObj);
//     // // execute query to get data
//     // // query.then((data,err)=>{
//     // //   console.log(data);
//     // // });
//     // const data=await query;
//     // //console.log(data);

//     //M02: To query Data
//     // const tours = await Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');

//     //SEND RESPONSE

//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     msg: error,
//   //   });
//   // }
// });


// exports.createTour = catchAsync(async (req, res, next) => {
//   // console.log(req.body);
//   //   const newId = tours[tours.length - 1].id + 1;
//   //   const newTour = Object.assign({ id: newId }, req.body);
//   //   tours.push(newTour);
//   //   fs.writeFile(
//   //     `${__dirname}/dev-data/data/tours-simple.json`,
//   //     JSON.stringify(tours),
//   //     (err) => {
//   //       res.status(201).json({
//   //         status: 'success',
//   //         data: {
//   //           tour: newTour,
//   //         },
//   //       });
//   //     }
//   //   );
//   // res.send('Done');

//   //M01:to create new doc
//   //   const newTour=new Tour({});
//   //   newTour.save().then();

//   //M02: to create doc

//   //console.log(req.body);
  
//   // try{
//     const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // }
//   //  catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     msg: err,
//   //   });
//   // }
// });

// // ROUTE: -GET /api/v1/tours/:id
// exports.getTour = catchAsync(async (req, res,next) => {
//   // console.log(req.params);
//   // try {
//     // const tour=await Tour.findOne({_id:req.params.id});
//     const tour = await Tour.findById(req.params.id);
//     if(!tour){
//       return next(new AppError('No Tour Found with that ID',404));
//     }
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: tour,
//       },
//     });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     msg: error,
//   //   });
//   // }
// });
// exports.aliasTopTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-ratingsAverage,price';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

// //to get top-5-expensive Tours
// exports.aliasTopExpensiveTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-price,-ratingsAverage';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

// //UPDATE_TOUR -PATCH: /api/v1/tours/:id
// exports.updateTour = catchAsync(async (req, res,next) => {
//   // try {
//     const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       //to run validators like minLength and maxLength and etc
//       runValidators: true,
//     });
//     if(!updatedTour){
//       return next(new AppError('No Tour Found with that ID',404));
//     }
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: updatedTour,
//       },
//     });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     msg: error,
//   //   });
//   // }
// });

// // ROUTE : -DELETE /api/v1/tours/:id
// exports.deleteTour = catchAsync(async(req, res,next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if(!tour){
//     return next(new AppError('No Tour Found with that ID',404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// //STATISTICS ROUTES
// exports.getTourStats = catchAsync(async (req, res,next) => {
//   // try {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } },
//       },
//       {
//         $group: {
//           //_id: '$difficulty', to group by easy || medium || difficult
//           //_id:'$ratingsAverage', to group by ratingsAverage
//           _id: { $toUpper: '$difficulty' }, //it will set EASY || MEDIUM || DIFFICULT into uppercase char
//           //_id:null,
//           numTours: { $sum: 1 },
//           avgRating: { $avg: '$ratingsAverage' },
//           numRatings: { $sum: '$ratingsQuantity' },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' },
//         },
//       },
//       {
//         $sort: {
//           avgPrice: 1,
//         },
//       },
//       // {
//       //   //$match:{_id:{$ne:'EASY'}}  //remove the EASY ones in the final result
//       // }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         stats,
//       },
//     });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: 'fails',
//   //     message: error.message,
//   //   });
//   // }
// });

// //Write a function to find busiest months as per given tours
// exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
//   // try {
//     console.log(req.params.y);
//     const year = req.params.year * 1;
//     console.log(year);
//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numToursStats: { $sum: 1 },
//           tours: { $push: '$name' },
//         },
//       },
//       {
//         $addFields: { month: '$_id' },
//       },
//       {
//         $project: {
//           _id: 0,
//         },
//       },
//       {
//         $sort: { numToursStats: -1 },
//       },
//       {
//         $limit: 5,
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       count: plan.length,
//       data: {
//         plan,
//       },
//     });
//   // } catch (error) {
//   //   res.status(404).json({
//   //     status: 'failed',

//   //     message: error.message,
//   //   });
//   // }
// });
// //==========================
// const User = require("../models/UserModel");
// const catchAsync = require("../utils/catchAsync");

// //USER ROUTES
// exports.getAllUsers =catchAsync( async(req, res,next) => {
//   const users=await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users: users,
//     },
//   });
 
// });
// exports.createUser = (req, res) => {
//   res.send('Create User');
// };
// exports.deleteUser = (req, res) => {
//   res.send('Delete A User');
// };
// exports.getUser = (req, res) => {
//   res.send('Get A User');
// };
// exports.updateUser = (req, res) => {
//   res.send('Update A User');
// };
// //=====================================
// const mongoose = require('mongoose');
// const slugify = require('slugify');
// const validator=require('validator');
// const TourSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'A Tour Must Have Name'],
//       unique: true,
//       trim: true,
//       maxLength: [40, 'A tour name must not exceed 40 chars'],
//       minLength: [10, 'A tour name must have min 10 chars'],
//      // validate:[validator.isAlpha,'Tour name must only contain characters']
//     },
//     slug: String,
//     duration: {
//       type: Number,
//       required: [true, 'A tour must have a duration.'],
//     },
//     maxGroupSize: {
//       type: Number,
//       required: [true, 'A tour must have a group size.'],
//     },
//     difficulty: {
//       type: String,
//       required: [true, 'A tour must have a difficulty'],
//       enum: {
//         values: ['easy', 'medium', 'difficulty'],
//         message: 'Dfficulty is either : easy || medium || difficult',
//       },
//     },

//     ratingsAverage: {
//       type: Number,
//       default: 4.5,
//       min: [1, 'Rating must be abouve 1.0'],
//       max: [5.0, 'Rating must be below 5.0'],
//     },
//     ratingsQuantity: {
//       type: Number,
//       default: 0,
//     },
//     price: {
//       type: Number,
//       required: [true, 'A tour must have a Price'],
//     },
//     priceDiscount: {
//       type: Number,
//       validate:{
//         validator: function (priceDiscountValue) {
//           //this only points to current document creation not updation
//         return priceDiscountValue < this.price;
//       },
//       message:'Discount price (${VALUE}) should be below the regular Price'
//     },
//     },
//     summary: {
//       type: String,
//       trim: true,
//       required: [true, 'A tour must have a summary'],
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     imageCover: {
//       type: String,
//       required: [true, 'A tour must have a Cover image'],
//     },
//     images: [String],
//     createdAt: {
//       type: Date,
//       default: Date.now(),
//       select: false,
//     },
//     startDates: [Date],
//     secretTour: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   //options other than schema
//   {
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );
// TourSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7;
// });
// //durationWeeks cant be use in our DB query Because this is not a part of our DB

// //DOCUMENT MIDDLEWARE - it runs before .save() cmd and .create()
// //right before we actually save it in the db
// // : --pre-save hook
// //can have multiple pre-hook
// TourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// //after all pre middlewares is executed
// TourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
// //==================
// //02:)-QUERY-MIDDLEWARE
// //-pre-find hook
// //executed before a find() query is going to execute
// //before await queryObject this is executed then data will get
// //    /^find/ this is regex all cmds havinf find
// TourSchema.pre(/^find/, function (next) {
//   //this is current query object
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });
// // TourSchema.pre('findOne', function (next) {
// //   //this is current query object
// //   this.find({ secretTour: { $ne: true } });

// //   next();
// // });

// //it will execute after our query is already executed
// TourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query Took ${Date.now() - this.start} millis`);
//   next();
// });

// //===============================================
// //03). AGGREGATION MIDDLEWARE
// //before and after aggregation happens
// TourSchema.pre('aggregate', function (next) {
//   //this points to current aggregation object
//   // unshift will ad this at first pos of array
//   this.pipeline().unshift({
//     $match: {
//       secretTour: { $ne: true },
//     },
//   });
//   console.log(this.pipeline());
//   next();
// });
// const Tour = mongoose.model('Tour', TourSchema);

// module.exports = Tour;
// //================================================
// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'User Must have a name'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'user must have a valid email ID'],
//     lowercase: true,
//     trim: true,
//     unique: true,
//     validate: [validator.isEmail, 'please provide a valid email-id'],
//   },
//   password: {
//     type: String,
//     required: [true, 'user must set a password'],
//     minlength: 8,
//     select: false,
//   },
//   passwordConfirm: {
//     type: String,
//     required: [true, 'plz confirm your password'],
//     validate: {
//       validator: function (el) {
//         //this will work only on .save() .create() not wth findbyidandupdateXXXXX
//         return el === this.password;
//       },
//       message: 'passwords are not the same',
//     },
//   },
//   passwordChangedAt:{
//     type:Date
//   },
//   photo: {
//     type: String,
//   },
// //   methods:{

// //      async correctPassword(
// //         candidatePassword,
// //         userPassword
// //       ) {
// //         // this.password wont work as we set select:false thats why we take userpassword also
// //         return await bcrypt.compare(candidatePassword, userPassword);
// //       }

// //   }
// });

// //PRE-SAVE-MIDDLEWARE on User model
// UserSchema.pre('save', async function (next) {
//   //only run this function if password was actually modified
//   if (!this.isModified('password')) return next();

//   //hash the password with cost at salt=12
//   this.password = await bcrypt.hash(this.password, 12);

//   //remove the password confirmField
//   this.passwordConfirm = undefined;
// });

// //INSTANCE METHOD
// //available to all the docs of certain collection
// UserSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   // this.password wont work as we set select:false thats why we take userpassword also
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// UserSchema.methods.changedPasswordAfter= function(JWTTimestamp){
//   if(this.passwordChangedAt){
//     const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
//     console.log('COMPARE TIMESTAMP',JWTTimestamp,changedTimeStamp);
//     return (
//       JWTTimestamp<changedTimeStamp
//     );
//   }
//   console.log('5555555555555555555555555555555555')
//   //FALSE means not changed
//   return false;

// };

// const User = mongoose.model('User', UserSchema);
// module.exports = User;
// //================================================
// const express = require('express');
// const tourController = require('./../controllers/tourControllers');
// const router = express.Router();
// const authControllers=require('./../controllers/authControllers')

// //param middleware only run for tour toutes.e
// // : /api/v1/tours/:id
// //router.param('id',tourController.checkID);

// // : /api/v1/tours
// router
//   .route('/top-5-cheap')
//   .get(tourController.aliasTopTours, tourController.getAllTours);
// router
//   .route('/top-5-expensive')
//   .get(tourController.aliasTopExpensiveTours, tourController.getAllTours);
// router.route('/tour-stats').get(tourController.getTourStats);
// router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// router
//   .route('/')
//   .get(authControllers.protect,tourController.getAllTours)
//   .post(tourController.createTour);

// //ROUTE: /api/v1/tours/:id
// router
//   .route('/:id')
//   .get(tourController.getTour)
//   .patch(tourController.updateTour)
//   .delete(tourController.deleteTour);

// module.exports = router;
// //=====================================
// const express = require('express');
// // const router = express.Router();
// const userController = require('./../controllers/userControllers');
// const authControllers = require('./../controllers/authControllers');

// router.post('/signup', authControllers.signUp);
// router.post('/login', authControllers.logIn);

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createUser);
// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

// module.exports = router;
// //=========================================
// class APIFeatures {
//     constructor(query, queryString) {
//       this.query = query;
//       console.log(`Test1 : ${JSON.stringify(queryString)}`);
//       this.queryString = queryString;
//     }
//     filter() {
//       //creating a deep-copy
//       const queryObj = { ...this.queryString };
//       const excludedFields = ['page', 'sort', 'limit', 'fields'];
//       excludedFields.forEach((el) => delete queryObj[el]);
  
//       console.log(`Test1:`, queryObj);
//       // console.log(req.query, queryObj);
  
//       //02: Advance Filtering
//       let queryStr = JSON.stringify(queryObj);
//       queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//       console.log(`Test 1.9`, queryStr);
//       console.log(`Test2:`, JSON.parse(queryStr));
  
//       //M01:To Query data
//       this.query = this.query.find(JSON.parse(queryStr));
//       //let query = Tour.find(JSON.parse(queryStr));
  
//       return this;
//     }
//     sort() {
//       if (this.queryString.sort) {
//         const sortBy = this.queryString.sort.split(',').join(' ');
//         this.query = this.query.sort(sortBy);
//       } else {
//         this.query = this.query.sort('-createdAt');
//       }
//       return this;
//     }
//     limitFields() {
//       if (this.queryString.fields) {
//         const fields = this.queryString.fields.split(',').join(' ');
//         this.query = this.query.select(fields);
//       } else {
//         this.query = this.query.select('-__v');
//       }
//       return this;
//     }
//     paginate() {
//       const page = this.queryString.page * 1 || 1;
//       const limit = this.queryString.limit * 1 || 100;
//       const skip = limit * (page - 1);
//       console.log(`TEST:1.99:page=${page}, limit=${limit}, skip=${skip}`);
//       this.query = this.query.skip(skip).limit(limit);
//       // if (this.queryString.page) {
//       //   const numTours = await Tour.countDocuments();
//       //   if (skip >= numTours) {
//       //     throw new Error('This Page Does not Exist');
//       //   }
//       //   //query.sort().select().skip().limit()
//       // }
//       return this;
//     }
//   }
//   module.exports=APIFeatures;
//   //======================================
//   class AppError extends Error{
//     constructor(message,statusCode){

//         super(message);
//         // this.message=message;
//         this.statusCode=statusCode;
//         this.status=`${statusCode}`.startsWith('4')?'fail':'error';
//         this.isOperational=true;

//         console.log('msg: ',this.message);
        
//         Error.captureStackTrace(this,this.constructor);

//     }
// }
// module.exports=AppError;
// //=====================
// module.exports= (fn) => {
//     return (req, res, next) => {
//       fn(req, res, next).catch((err) => next(err));
//     };
//   };
//   //============================
//   const express = require('express');
// const morgan = require('morgan');
// const AppError=require('./utils/appError');
// const globalErrorHandler=require('./controllers/errorControllers');
// const app = express();

// //iss middleware ke bina req.body se json data retrieve nhi krr skte h
// app.use(express.json());

// app.use(morgan('dev'));
// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// //mounting the routers to a particular routes
// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);

// //this middle will be executed last after all other routes are checked
// app.all('*', (req, res, next) => {
//   // res.status(404).json({
//   //   status: 'fail',
//   //   message: `Can't find ${req.originalUrl} on this`,
//   // });
//   // const err = new Error(`Can't find ${req.originalUrl} on this`);
//   // err.status='fail';
//   // err.statusCode=404;


//   //when we pass any arg to next the express assume that there is an error then express will skip all middlewares in between and directly jump to aour global error handling middleware;
//   //next(err);
//   next(new AppError(`Can't find ${req.originalUrl} on this`,404))
// });

// //ERROR HANDLING MIDDLEWARE
// //by lookin at its 4 params in function express came to know that it is a global error handling middleware
// app.use(globalErrorHandler);

// //middleware between request and response

// module.exports = app;
// //=============================
// {
//     "name": "natours",
//     "version": "1.0.0",
//     "description": "learning node express",
//     "main": "app.js",
//     "scripts": {
//       "start": "nodemon server.js",
//       "debug": "ndb server.js",
//       "start:prod": "NODE_ENV=production nodemon server.js"
//     },
//     "author": "Amit",
//     "license": "ISC",
//     "dependencies": {
//       "bcryptjs": "^2.4.3",
//       "dotenv": "^16.3.1",
//       "express": "^4.18.2",
//       "jsonwebtoken": "^9.0.2",
//       "mongoose": "^8.0.3",
//       "morgan": "^1.10.0",
//       "slugify": "^1.6.6",
//       "validator": "^13.11.0"
//     }
//   }
// //=================================
// const app = require('./app');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// process.on('uncaughtException',(err)=>{
//   console.log(err.name,err.message);
//   console.log("UNCAUGHT EXCEPTION---Shutting Down");
//   console.log(err.name,err.message);
//   server.close(()=>{
//     process.exit(1)
//   });
// });
// dotenv.config({ path: './config.env' });

// mongoose
//   .connect(process.env.DB_LOCAL, {
//     useNewUrlParser: true,
//   })
//   .then((con) => {
//     //console.log(con);
//     console.log('Mongo Connected Success Fully');
//   }).catch(err=>console.log(err));


// const port = process.env.PORT || 3000;
// const server=app.listen(port, () => {
//   console.log('Server Running on Port:' + port);
// });

// //UNHANDLED PROMISE REJECTIONS
// process.on('unhandledRejection',(err)=>{
//   console.log(err.name,err.message);
//   console.log("UNHANDLED REJECTION");
//   server.close(()=>{
//     process.exit(1)
//   });

// });


// //============================