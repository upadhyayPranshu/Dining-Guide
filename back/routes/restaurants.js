const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");

/* Get all restaurants */
router.get("/", async (req, res) => {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
});

/* Get single restaurant by ID */
router.get("/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch restaurant" });
    }
});

/* Add restaurant */
router.post("/", async (req, res) => {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.json({ message: "Restaurant added" });
});

module.exports = router;
