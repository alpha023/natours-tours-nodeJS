const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/TourModel');
const User=require('./../../models/UserModel');
const Review=require('./../../models/ReviewModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect('mongodb://127.0.0.1:27017/natours', {
    useNewUrlParser: true,
  })
  .then((con) => {
    //console.log(con);
    console.log('Mongo Connected Success Fully');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//IMPORT DATA INTO MONGO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users,{validateBeforeSave:false});
    console.log('Data Loaded Successfully in DB...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//DELETE ALL DATA FROM COLLECTION
const deleteAll = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Deleted Success Fully...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if(process.argv[2]==='--import'){
    importData();
}else if(process.argv[2]==='--delete'){
    console.log("Deleted")
    deleteAll();
}else{

}
console.log(process.argv);
