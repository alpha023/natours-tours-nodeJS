// review / rating /createdAt /ref to user / ref to tour
const mongoose=require('mongoose');
const ReviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review can\'t be Empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review Must Belong To A Tour.']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must Belong to a User.']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Pre find Query Middleware
ReviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // });

    this.populate({
        path:'user',
        select:'name photo'
    });
    next();
});

//We use Parent referncing for the Reviews model
//that is Parent||Tour ko apne reviews k baare me nhi pata h
//but each review has its parent info

//SOLUTION : Virtual Populate

//STATIC METHODS ON THE MODEL
ReviewSchema.statics.calcAverageRatings=async function(tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },{
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    console.log(stats);
}

ReviewSchema.pre('save',function(next){
    //this points to current review
    // Review.calcAverageRatings(this.tour);

    this.constructor.calcAverageRatings(this.tour);
    next();
});
const Review=mongoose.model('Review',ReviewSchema);
module.exports=Review;

//POST /tour/32uehfuefuyegfe5wegwugfTOURID4d/review
//GET /tour/4683hegfhegfehf48743trhegf/review
//nested ROUTE