const User = require('../models/UserModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//USER ROUTES
exports.getAllUsers=factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users: users,
//     },
//   });
// });
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.createUser = (req, res) => {
  res.send('Create User');
};

//Delete A USER
exports.deleteUser = factory.deleteOne(User);
//Update A USER DOCUMENT
//never update password by this!!!!!!!!
exports.updateUser = factory.updateOne(User);

exports.getUser = factory.getOne(User);
exports.updateMe = async (req, res, next) => {
  // 1). Create Error If User Posts Password Data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This Route Is Not For Password Updates. please use /updateMyPassword',
        400
      )
    );
  }

  //2). Update User document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // const user =await User.findById(req.user.id);
  // user.name='ALPHA';
  // await user.save(); it wil create validation passwordConfirm Error
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

//DELETE ME
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//GET ME
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}
