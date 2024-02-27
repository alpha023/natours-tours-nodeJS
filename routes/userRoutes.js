const express = require('express');
const router = express.Router();
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');
// const reviewControllers = require('./../controllers/reviewController');

router.post('/signup', authControllers.signUp);
router.post('/login', authControllers.logIn);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

//this middle ware will be executed for all the below methods
// middlewares run in sequence always
//protect all
router.use(authControllers.protect);
router.patch(
  '/updateMyPassword',
  authControllers.protect,
  authControllers.updatePassword
);

router.get(
  '/me',
  authControllers.protect,
  userControllers.getMe,
  userControllers.getUser
);
router.patch('/updateMe', authControllers.protect, userControllers.updateMe);
router.patch('/deleteMe', authControllers.protect, userControllers.deleteMe);

router.use(authControllers.restrictTo('admin'));

router.use(authControllers.restrictTo('admin'));
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

module.exports = router;
