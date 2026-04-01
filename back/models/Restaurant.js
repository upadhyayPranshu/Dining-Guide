const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
    name: String,
    cuisine: String,
    rating: Number,
    address: String,
    image: String
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
