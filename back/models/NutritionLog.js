const mongoose = require("mongoose");

const NutritionLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
    },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("NutritionLog", NutritionLogSchema);
