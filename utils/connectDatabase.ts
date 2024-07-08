import mongoose from "mongoose";

type Error = {
  message: string;
};

const connectDatabase = async (database: string) => {
  console.log(process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(
      (process.env.MONGODB_URI as string)
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDatabase;
