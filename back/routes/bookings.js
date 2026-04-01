const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// Create a new booking
router.post("/", async (req, res) => {
    try {
        const { userId, restaurantId, name, date, time, guests } = req.body;

        // Validation for missing fields
        if (!userId || !restaurantId || !name || !date || !time || !guests) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Capacity Check: Max 3 tables per restaurant per date per time
        const existingBookings = await Booking.countDocuments({
            restaurantId,
            date,
            time,
            status: "Confirmed"
        });

        if (existingBookings >= 3) {
            return res.status(400).json({ error: "Sorry, this time slot is fully booked. Please choose another time." });
        }

        // Create booking
        const booking = new Booking({
            userId,
            restaurantId,
            name,
            date,
            time,
            guests
        });

        await booking.save();
        res.status(201).json({ message: "Booking confirmed!", booking });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// Get user's bookings
router.get("/user/:userId", async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate("restaurantId", "name image cuisine address")
            .sort({ date: 1, time: 1 });
            
        res.json(bookings);
    } catch (error) {
        console.error("Fetch Bookings Error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Cancel a booking
router.delete("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        booking.status = "Cancelled";
        await booking.save();
        
        res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to cancel booking" });
    }
});

module.exports = router;
