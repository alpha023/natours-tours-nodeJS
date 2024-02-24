// const fs = require('fs');
const Tour = require('./../models/TourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       msg: 'Invalid ID',
//     });
//   }
//   next();
// };
exports.getAllTours = catchAsync(async (req, res,next) => {
  // try {
    // console.log(req.query);

    //creating a deep-copy
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    // // console.log(req.query, queryObj);

    // //02: Advance Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // //M01:To Query data
    // let query = Tour.find(JSON.parse(queryStr));

    //2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(req.query.sort, sortBy);
    //   query = query.sort(sortBy);

    //   //sort('price ratingsAverage')
    // } else {
    //   // DEfault Sorting
    //   query = query.sort('-createdAt');
    // }

    //3) Field Limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   //query=query.select('name createdAt')
    //   // minus sign indicates exclusion of such fields
    //   query = query.select('-__v');
    // }

    //04.) PAGINATION
    // page=2&limit=10, 1-10=page1,11-20=page2
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = limit * (page - 1);

    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error('This Page Does not Exist');
    //   }
    //   //query.sort().select().skip().limit()
    // }
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // const tours = await query;
    // const tours = await Tour.find(JSON.parse(queryStr));

    //create query
    // const query=Tour.find(queryObj);
    // // execute query to get data
    // // query.then((data,err)=>{
    // //   console.log(data);
    // // });
    // const data=await query;
    // //console.log(data);

    //M02: To query Data
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    //SEND RESPONSE

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     msg: error,
  //   });
  // }
});


exports.createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  //   const newId = tours[tours.length - 1].id + 1;
  //   const newTour = Object.assign({ id: newId }, req.body);
  //   tours.push(newTour);
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       res.status(201).json({
  //         status: 'success',
  //         data: {
  //           tour: newTour,
  //         },
  //       });
  //     }
  //   );
  // res.send('Done');

  //M01:to create new doc
  //   const newTour=new Tour({});
  //   newTour.save().then();

  //M02: to create doc

  //console.log(req.body);
  
  // try{
    const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // }
  //  catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     msg: err,
  //   });
  // }
});

// ROUTE: -GET /api/v1/tours/:id
exports.getTour = catchAsync(async (req, res,next) => {
  // console.log(req.params);
  // try {
    // const tour=await Tour.findOne({_id:req.params.id});
    // const tour = await Tour.findById(req.params.id).populate('guides'); //fill it guides with actual data
    const tour =await Tour.findById(req.params.id).populate('reviews');
    // const tour = await Tour.findById(req.params.id).populate({
    //   path:'guides',
    //   select:'-__v -passwordChangedAt'
    // });
    if(!tour){
      return next(new AppError('No Tour Found with that ID',404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     msg: error,
  //   });
  // }
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//to get top-5-expensive Tours
exports.aliasTopExpensiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//UPDATE_TOUR -PATCH: /api/v1/tours/:id
exports.updateTour = catchAsync(async (req, res,next) => {
  // try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //to run validators like minLength and maxLength and etc
      runValidators: true,
    });
    if(!updatedTour){
      return next(new AppError('No Tour Found with that ID',404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     msg: error,
  //   });
  // }
});

// ROUTE : -DELETE /api/v1/tours/:id
exports.deleteTour = catchAsync(async(req, res,next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour){
    return next(new AppError('No Tour Found with that ID',404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//STATISTICS ROUTES
exports.getTourStats = catchAsync(async (req, res,next) => {
  // try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          //_id: '$difficulty', to group by easy || medium || difficult
          //_id:'$ratingsAverage', to group by ratingsAverage
          _id: { $toUpper: '$difficulty' }, //it will set EASY || MEDIUM || DIFFICULT into uppercase char
          //_id:null,
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          numRatings: { $sum: '$ratingsQuantity' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      // {
      //   //$match:{_id:{$ne:'EASY'}}  //remove the EASY ones in the final result
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fails',
  //     message: error.message,
  //   });
  // }
});

//Write a function to find busiest months as per given tours
exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
  // try {
    console.log(req.params.y);
    const year = req.params.year * 1;
    console.log(year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStats: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numToursStats: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json({
      status: 'success',
      count: plan.length,
      data: {
        plan,
      },
    });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'failed',

  //     message: error.message,
  //   });
  // }
});
