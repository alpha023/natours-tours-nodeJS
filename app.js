const express = require('express');
const morgan = require('morgan');
const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorControllers');
const app = express();

//iss middleware ke bina req.body se json data retrieve nhi krr skte h
app.use(express.json());

app.use(morgan('dev'));
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//mounting the routers to a particular routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
