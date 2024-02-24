const User = require("../models/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//USER ROUTES
exports.getAllUsers =catchAsync( async(req, res,next) => {
  const users=await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
 
});
const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach((el)=>{
    if(allowedFields.includes(el)){
      newObj[el]=obj[el];
    }
  });
  return newObj;
};
exports.createUser = (req, res) => {
  res.send('Create User');
};
exports.deleteUser = (req, res) => {
  res.send('Delete A User');
};
exports.getUser = (req, res) => {
  res.send('Get A User');
};
exports.updateUser = (req, res) => {
  res.send('Update A User');
};
exports.updateMe=async (req,res,next)=>{
  // 1). Create Error If User Posts Password Data
  
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError("This Route Is Not For Password Updates. please use /updateMyPassword",400));
  }

  //2). Update User document
  const filteredBody=filterObj(req.body,'name','email');
  const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});
  // const user =await User.findById(req.user.id);
  // user.name='ALPHA';
  // await user.save(); it wil create validation passwordConfirm Error
  res.status(200).json({
    status:'success',
    data:{
      user:updatedUser
    }
  });
};

//DELETE ME
exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false});
  res.status(204).json({
    status:'success',
    data:null
  });
});