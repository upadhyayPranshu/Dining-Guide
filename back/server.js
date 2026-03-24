const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../FrontEnd")));

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/menu-items", require("./routes/menuItems"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/reviews", require("./routes/reviews"));

// Fallback for frontend routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../FrontEnd/index.html"));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
});
