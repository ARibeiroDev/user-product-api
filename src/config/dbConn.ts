import mongoose from "mongoose";

export const connectDB = async () => {
  const URI = process.env.MONGO_URI;

  if (!URI) throw new Error("MONGO_URI is not defined!");

  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
