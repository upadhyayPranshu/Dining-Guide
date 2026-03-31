const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware");

/* Get all restaurants */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
});

/* Get single restaurant by ID */
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(400).json({ error: "Invalid restaurant ID" });
    }
});

/* Add restaurant (Admin only potentially, but currently open) */
router.post("/", authMiddleware, async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        res.json({ message: "Restaurant added successfully", restaurant });
    } catch (err) {
        res.status(400).json({ error: "Failed to add restaurant" });
    }
});

module.exports = router;
