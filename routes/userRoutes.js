const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');

router.post('/signup', authControllers.signUp);
router.post('/login', authControllers.logIn);

router.post('/forgotPassword',authControllers.forgotPassword);
router.patch('/resetPassword/:token',authControllers.resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
