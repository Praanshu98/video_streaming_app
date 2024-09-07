import dotenv from "dotenv";
import express from "express";

import connectDB from "./db/index.js";

const app = express();

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error => \n", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(` Server is running on port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Mongo DB Connection failed: \n", error);
  });

// import { DB_NAME } from "./constants.js";

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.error("Error => \n", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error => \n", error);
//   }
// })();
