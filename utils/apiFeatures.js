class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      console.log(`Test1 : ${JSON.stringify(queryString)}`);
      this.queryString = queryString;
    }
    filter() {
      //creating a deep-copy
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);
  
      console.log(`Test1:`, queryObj);
      // console.log(req.query, queryObj);
  
      //02: Advance Filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      console.log(`Test 1.9`, queryStr);
      console.log(`Test2:`, JSON.parse(queryStr));
  
      //M01:To Query data
      this.query = this.query.find(JSON.parse(queryStr));
      //let query = Tour.find(JSON.parse(queryStr));
  
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = limit * (page - 1);
      console.log(`TEST:1.99:page=${page}, limit=${limit}, skip=${skip}`);
      this.query = this.query.skip(skip).limit(limit);
      // if (this.queryString.page) {
      //   const numTours = await Tour.countDocuments();
      //   if (skip >= numTours) {
      //     throw new Error('This Page Does not Exist');
      //   }
      //   //query.sort().select().skip().limit()
      // }
      return this;
    }
  }
  module.exports=APIFeatures;