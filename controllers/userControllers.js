const User = require("../models/UserModel");
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
