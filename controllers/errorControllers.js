const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //operationalError , trusted error and send msg to client
  if (err.isOperational) {
    console.log(`=======~=======`,err.msg)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.msg,extra:"extra",
    });
    //Programming error or other unknown error dont want to leak the details to the client
  } else {
    //1).Log error
    console.error('ERROR:', err);

    //2). send generated msg
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  // const val=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  
  const val = err.keyValue;
  const message = `Duplicate field value : ${Object.values(val).join(',')}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data. ${errors.join(', ')}`;
  return new AppError(msg, 400);
};
const handleJsonWebTokenError=(err)=>{
  return new AppError('Invalid Token, Please Login again',401);
}
const handleJWTExpiredError=(err)=>{
  return new AppError('Your Token is Expired, Please Log In Again',401);
};
module.exports = (err, req, res, next) => {
  console.log(`err.errors.name:`, err.message);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.msg=err.message||'ERROR!!!';
  // return res.status(404).json({
  //   err:err
  // });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {

    // return res.status(401).json({message:err.message});
    //all props are not duplicated here
     let error = { ...err };// -->only shallow copy not deep copy

    //DEEP COPY
    // let error=JSON.parse(JSON.stringify(err));
    // let error=Object.assign(Object.create(Object.getPrototypeOf(err)),err);
    // return (res.status(222).json({
    //   error:err,
    //   erro2:error
    // }));
    console.log({...err},error);
     console.log(`ERROR-msg : `, error.msg);
    
    if (error.kind === 'ObjectId') {
      // console.log(`ERRORname : `, error.name);
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if(err.name==='JsonWebTokenError'){

      error=handleJsonWebTokenError(error);

    }
    if(err.name==='TokenExpiredError')error=handleJWTExpiredError(error);

    sendErrorProd(error, res);
  }

  next();
};
