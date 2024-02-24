const express = require('express');
const router = express.Router();
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');
const reviewControllers = require('./../controllers/reviewController');

router.post('/signup', authControllers.signUp);
router.post('/login', authControllers.logIn);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);
router.patch(
  '/updateMyPassword',
  authControllers.protect,
  authControllers.updatePassword
);

router.patch('/updateMe', authControllers.protect, userControllers.updateMe);
router.patch('/deleteMe', authControllers.protect, userControllers.deleteMe);

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
