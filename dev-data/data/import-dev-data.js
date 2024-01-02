const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/TourModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect('mongodb://127.0.0.1:27017/natours', {
    useNewUrlParser: true,
  })
  .then((con) => {
    //console.log(con);
    console.log('Mongo Connected Success Fully');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//IMPORT DATA INTO MONGO DB
const importData = async () => {
  try {
    await Tour.create(tours);
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
