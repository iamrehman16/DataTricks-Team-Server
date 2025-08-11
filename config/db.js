import mongoose from "mongoose";
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Mongo DB connected!');
    } catch (error) {
        console.log('Failed to connect db');
        process.exit(1);
    }
}

export default connectDB;