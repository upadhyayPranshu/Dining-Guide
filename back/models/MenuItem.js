const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    price: Number,
    category: {
        type: String,
        enum: ["Appetizer", "Main Course", "Dessert", "Beverage", "Side"],
        default: "Main Course"
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
