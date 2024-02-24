const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const util = require('util');

const signInToken = (id) => {
  return jwt.sign(
    { id: id }, //payload
    process.env.JWT_SECRET, //SECRET
    { expiresIn: process.env.JWT_EXPIRES_IN } //DURATION OF TOKEN
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, //it will work only with https here it wont work because we are not using https
    httpOnly: true,
  };
  if(process.env.NODE_ENV==='production') cookieOptions.secure=true;
  res.cookie('jwt', token, cookieOptions);
  user.password=undefined; //remove the password from the response object
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(user, 201, res);

  // const token = signInToken(user._id);

  // res.status(201).json({
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: user,
  //   },
  // });
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
    return next(new AppError('Incorrect email or password', 401)); //fool the hacker

  //3). if everything is OK , send the token to client
  createSendToken(user, 200, res);
  // const token = signInToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
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
  console.log('TOKEN---- :', token);
  if (!token) return next(new AppError('Please Log In To get Access', 401));
  console.log('TOKEN==== :', token);
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
  req.user = freshUser;
  next();
});

//
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','lead-guide']
    //in above middle ware function we set req.user=freshUser in protect middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action', 403)
      );
    }
    next();
  };
};

//PASSWORD RESET FUNCTIONALITY
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1). Get User based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is No user with this email address', 404));
  }

  //2) Generate the random password reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3). Send it to users email the token to reset email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password,please ignore this email!!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your passsword reset token (valid for only 10 mins)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token Sent to email!!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending email, try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1). Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  });

  //2). If token is not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();

  //3). Update changedPasswordAt property of the user

  //4). Log The user In, send the json web token to the client
  createSendToken(user, 200, res);
  // const token = signInToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
});

//UPDATE PASSWORD OF CURRENT USER
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1). Get User From the Collection
  const user = await User.findById(req.user._id).select('+password');

  // 2). Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current Password Is Wrong!!', 401));
  }
  // 3). If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate -->we didnit use it bcoz then the password confitm validator wont run there
  // here mongo wont create object then this.password will give error there.
  //pre save middle ware will not work if we use User.findbyId And Update

  // 4). Log the user in send jwt token
  createSendToken(user, 200, res);
});
