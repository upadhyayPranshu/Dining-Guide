const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

FavoriteSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);
