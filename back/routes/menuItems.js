const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

/* Get all menu items for a restaurant */
router.get("/restaurant/:restaurantId", async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
});

/* Get single menu item */
router.get("/:id", async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu item" });
    }
});

/* Add menu item */
router.post("/", async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        res.json({ message: "Menu item added", menuItem });
    } catch (error) {
        res.status(400).json({ error: "Failed to add menu item" });
    }
});

/* Search menu items by name */
router.get("/search/:query", async (req, res) => {
    try {
        const menuItems = await MenuItem.find({
            name: { $regex: req.params.query, $options: "i" }
        }).populate("restaurantId");
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;
