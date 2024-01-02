const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException',(err)=>{
  console.log(err.name,err.message);
  console.log("UNCAUGHT EXCEPTION---Shutting Down");
  console.log(err.name,err.message);
  server.close(()=>{
    process.exit(1)
  });
});
dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
  })
  .then((con) => {
    //console.log(con);
    console.log('Mongo Connected Success Fully');
  }).catch(err=>console.log(err));


const port = process.env.PORT || 3000;
const server=app.listen(port, () => {
  console.log('Server Running on Port:' + port);
});

//UNHANDLED PROMISE REJECTIONS
process.on('unhandledRejection',(err)=>{
  console.log(err.name,err.message);
  console.log("UNHANDLED REJECTION");
  server.close(()=>{
    process.exit(1)
  });

});


