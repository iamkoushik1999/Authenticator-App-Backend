// Packages
import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";
dotenv.config();
// MONGODB_URL
const { NODE_ENV, MONGODB_URL_DEV, MONGODB_URL_PROD } = process.env;

// --------------------------------------------------------------------------

const connectDB = async (req, res, next) => {
  try {
    if (NODE_ENV == "production") {
      const conn = await mongoose.connect(MONGODB_URL_PROD);
      console.log(
        `MONGODB CONNECTED AT :-> ${conn.connection.host}`.cyan.underline
      );
    } else {
      const conn = await mongoose.connect(MONGODB_URL_DEV);
      console.log(
        `MONGODB CONNECTED AT :-> ${conn.connection.host}`.blue.underline
      );
    }
  } catch (error) {
    console.log(`MONGODB ERROR`, error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log(
    `MONGODB DISCONNECTED FROM :-> "${NODE_ENV}" Database`.red.underline
  );
});

mongoose.connection.on("connected", () => {
  console.log(
    `MONGODB CONNECTED WITH :-> "${NODE_ENV}" Database`.green.underline
  );
});

export default connectDB;
