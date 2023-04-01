import mongoose from "mongoose";
import "dotenv/config";

export const connectToDatabase = () => {
  try {
    mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.DB_URI
        : process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => {
        console.log(`Connected to database... ${process.env.DB_URI}`);
      }
    );
  } catch (error) {
    console.error(`Can't Connect To Database...`);
  }
};
