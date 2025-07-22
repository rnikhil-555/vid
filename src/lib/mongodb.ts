import mongoose from "mongoose";

export async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("mongodb connected");
    });
    connection.on("error", (err) => {
      console.log(
        "mongodb connection error,please make sure is up and running: " + err
      );
      process.exit;
    });
  } catch (error) {
    console.error("Something went wrong in connecting to Db");
    console.log(error);
  }
}