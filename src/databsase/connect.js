import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    //connection to database
    const dbURL =
      process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_PATH}/${process.env.DATABASE_NAME}`
        : `${process.env.LIVE_PATH}/${process.env.DATABASE_NAME}`;
    const connection = await mongoose.connect(dbURL);
    console.log(
      `\n MONGODB connection  || DB_HOST : ${connection.connection.host}`
    );
  } catch (err) {
    console.log("MONGODB database connection error", err);
    process.exit(1);
  }
};
