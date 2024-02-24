const express = require('express');
const morgan = require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorControllers');
const app = express();

//Secure http headers by using helmet package
app.use(helmet());


//iss middleware ke bina req.body se json data retrieve nhi krr skte h
app.use(express.json({limit:'10kb'})); //body larger than 10KB will not be accepted any more

//Data Sanitization agains NoSQL query injection
//withput email but with password anyy one can log in it
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//PREVENT PARAMETER POLLUTION
app.use(hpp({
  whitelist:[
    'duration','ratingsQuantity','maxGroupSize','difficulty','ratingsAverage','price'
  ]
}));


//Serving the static files
app.use(express.static(`${__dirname}/public`));


// GLOBAL MIDDLEWARES
app.use(morgan('dev'));
// ++++++++++++++++++++++++++++++++==
//to avoid brute-force-attack denial-of-service
//limit requests from same api
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000, //maximum requests in one hour from the same IP
  message:"Too many requests from this IP, please try again in one hour..."
});
app.use('/api',limiter);

//++++++++++++++++++++++++++++++++++
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//mounting the routers to a particular routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);

//this middle will be executed last after all other routes are checked
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this`);
  // err.status='fail';
  // err.statusCode=404;


  //when we pass any arg to next the express assume that there is an error then express will skip all middlewares in between and directly jump to aour global error handling middleware;
  //next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this`,404))
});

//ERROR HANDLING MIDDLEWARE
//by lookin at its 4 params in function express came to know that it is a global error handling middleware
app.use(globalErrorHandler);

//middleware between request and response

module.exports = app;
