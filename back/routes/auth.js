const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

/* =====================
   SIGNUP
===================== */

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: "User registered successfully" });

    } catch (error) {
        res.status(400).json({ error: "User already exists" });
    }
});

/* =====================
   LOGIN
===================== */

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ 
        message: "Login successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});

module.exports = router;
