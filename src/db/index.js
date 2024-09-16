import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@video-streaming-app.oermr.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=video-streaming-app`
    );
    console.log(
      `\n MongoDB connected! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error => \n", error);
    process.exit(1);
  }
};

export default connectDB;
