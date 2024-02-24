const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Must have a name'],
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  email: {
    type: String,
    required: [true, 'user must have a valid email ID'],
    lowercase: true,
    trim: true,
    unique: true,
    validate: [validator.isEmail,'please provide a valid email-id'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'user must set a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'plz confirm your password'],
    validate: {
      validator: function (el) {
        //this will work only on .save() .create() not wth findbyidandupdateXXXXX
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  PasswordResetExpires: Date,
  photo: {
    type: String,
  },
  //   methods:{

  //      async correctPassword(
  //         candidatePassword,
  //         userPassword
  //       ) {
  //         // this.password wont work as we set select:false thats why we take userpassword also
  //         return await bcrypt.compare(candidatePassword, userPassword);
  //       }

  //   }
});

//PRE-SAVE-MIDDLEWARE on User model
UserSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with cost at salt=12
  this.password = await bcrypt.hash(this.password, 12);

  //remove the password confirmField
  this.passwordConfirm = undefined;
});

//any query find || findById || findByIdAndUpdate ....
//Query Middle Ware...
UserSchema.pre(/^find/, function (next) {
  //this points to the current query object
  this.find({ active: {$ne:false} });
  next();
});

//INSTANCE METHOD
//available to all the docs of certain collection
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password wont work as we set select:false thats why we take userpassword also
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log('COMPARE TIMESTAMP', JWTTimestamp, changedTimeStamp);
    return JWTTimestamp < changedTimeStamp;
  }
  console.log('5555555555555555555555555555555555');
  //FALSE means not changed
  return false;
};

//Password Reset
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({
    resetToken: resetToken,
    passwordResetToken: this.passwordResetToken,
  });
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000; //10 mins validity
  return resetToken;
};

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //database save is slower
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
