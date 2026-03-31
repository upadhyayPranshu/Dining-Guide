const mongoose = require("mongoose");
require("dotenv").config();
const Restaurant = require("./models/Restaurant");

const restaurants = [
    {
        name: "Spice Hub",
        cuisine: "Indian",
        rating: 4,
        address: "123 Curry Lane, Food City"
    },
    {
        name: "Sushi Zen",
        cuisine: "Japanese",
        rating: 5,
        address: "456 Sakura Street, Downtown"
    },
    {
        name: "The Pasta Project",
        cuisine: "Italian",
        rating: 5,
        address: "789 Olive Grove, Uptown"
    },
    {
        name: "Burger Haven",
        cuisine: "American",
        rating: 4,
        address: "101 Grill Road, Westside"
    },
    {
        name: "Taco Town",
        cuisine: "Mexican",
        rating: 3,
        address: "202 Salsa Blvd, Eastside"
    },
    {
        name: "Le Bistro",
        cuisine: "French",
        rating: 5,
        address: "303 Baguette Way, Central"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas for seeding...");

        // Clear existing data
        await Restaurant.deleteMany({});
        console.log("Cleared existing restaurants.");

        // Insert new data
        await Restaurant.insertMany(restaurants);
        console.log(`Successfully seeded ${restaurants.length} restaurants!`);

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("Error seeding database:", error.message);
        process.exit(1);
    }
};

seedDB();
