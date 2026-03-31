const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas (Cloud)");
    } catch (error) {
        console.error("MongoDB Atlas connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
