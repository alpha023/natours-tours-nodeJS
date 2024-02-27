const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

//it could be worked for every model to delete Generalization
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};
// ROUTE : -DELETE /api/v1/tours/:id

//UPDATE A MODEL GENERALIZED METHOD
exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //to run validators like minLength and maxLength and etc
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(new AppError('No Doc Found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });
};

//CREATE ONE
exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });
};

//GET ONE
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // const tour=await Tour.findOne({_id:req.params.id});
    // const tour = await Tour.findById(req.params.id).populate('guides'); //fill it guides with actual data
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions); //manipulate the query object
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Document Found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//GET ALL
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    //to allow nested GET reviews on the tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
};

