const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

/* Get reviews for a restaurant */
router.get("/restaurant/:restaurantId", async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

/* Get average rating for a restaurant */
router.get("/rating/:restaurantId", async (req, res) => {
    try {
        const result = await Review.aggregate([
            { $match: { restaurantId: new (require("mongoose").Types.ObjectId)(req.params.restaurantId) } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
        
        if (result.length > 0) {
            res.json({ avgRating: result[0].avgRating.toFixed(1), count: result[0].count });
        } else {
            res.json({ avgRating: 0, count: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to get rating" });
    }
});

/* Add a review */
router.post("/", async (req, res) => {
    try {
        const { userId, restaurantId, rating, comment } = req.body;
        
        const existingReview = await Review.findOne({ userId, restaurantId });
        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save();
            return res.json({ message: "Review updated", review: existingReview });
        }

        const review = new Review({ userId, restaurantId, rating, comment });
        await review.save();
        res.json({ message: "Review added", review });
    } catch (error) {
        res.status(400).json({ error: "Failed to add review" });
    }
});

/* Delete a review */
router.delete("/:id", async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review deleted" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete review" });
    }
});

module.exports = router;
