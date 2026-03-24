const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");

/* Get user's favorites */
router.get("/user/:userId", async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId })
            .populate("restaurantId");
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

/* Check if restaurant is favorited */
router.get("/check/:userId/:restaurantId", async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            userId: req.params.userId,
            restaurantId: req.params.restaurantId
        });
        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ error: "Failed to check favorite" });
    }
});

/* Add to favorites */
router.post("/", async (req, res) => {
    try {
        const { userId, restaurantId } = req.body;
        const existing = await Favorite.findOne({ userId, restaurantId });
        
        if (existing) {
            return res.status(400).json({ error: "Already in favorites" });
        }

        const favorite = new Favorite({ userId, restaurantId });
        await favorite.save();
        res.json({ message: "Added to favorites" });
    } catch (error) {
        res.status(400).json({ error: "Failed to add favorite" });
    }
});

/* Remove from favorites */
router.delete("/:userId/:restaurantId", async (req, res) => {
    try {
        await Favorite.findOneAndDelete({
            userId: req.params.userId,
            restaurantId: req.params.restaurantId
        });
        res.json({ message: "Removed from favorites" });
    } catch (error) {
        res.status(400).json({ error: "Failed to remove favorite" });
    }
});

module.exports = router;
