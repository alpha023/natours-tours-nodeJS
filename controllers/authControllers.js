const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const util = require('util');

const signInToken = (id) => {
  return jwt.sign(
    { id: id }, //payload
    process.env.JWT_SECRET, //SECRET
    { expiresIn: process.env.JWT_EXPIRES_IN } //DURATION OF TOKEN
  );
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signInToken(user._id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1). Check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }

  //2). Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password'); //to explicitly select the password field

  if (!user || !(await user.correctPassword(password, user.password)))
    return new AppError('Incorrect email or password', 401); //fool the hacker

  //3). if everything is OK , send the token to client
  const token = signInToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1). Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('TOKEN :', token);
  if (!token) return next(new AppError('Please Log In To get Access', 401));

  //2). Verification of TOKEN
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log('decoded : ', decoded);

  //3). Check if User Still Exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token is no longer exist', 401)
    );

  //4). Check if user changed password after the JWT token is issued
//   console.log('RESULT:',await freshUser.changedPasswordAfter(decoded.iat));
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password,login again', 401)
    );

  //everything ok then only next middleware is called
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user=freshUser;
  next();
});
