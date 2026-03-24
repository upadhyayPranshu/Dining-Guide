const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");

/* Get all restaurants */
router.get("/", async (req, res) => {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
});

/* Add restaurant */
router.post("/", async (req, res) => {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.json({ message: "Restaurant added" });
});

module.exports = router;
