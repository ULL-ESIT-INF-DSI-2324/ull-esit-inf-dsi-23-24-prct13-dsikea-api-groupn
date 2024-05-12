import { connect } from "mongoose";

connect("mongodb://127.0.0.1:27017/dsikea-api-rest")
  .then(() => {
    console.log("Connection to MongoDB server established");
  })
  .catch(() => {
    console.log("Unable to connect to MongoDB server");
  });

// Ejecutar en RENDER

// connect(process.env.MONGODB_URL!)
//   .then(() => {
//     console.log("Connected to the database");
//   })
//   .catch(() => {
//     console.log("Something went wrong when conecting to the database");
//     process.exit(-1);
//   });
