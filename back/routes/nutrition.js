const express = require("express");
const router = express.Router();
const NutritionLog = require("../models/NutritionLog");

/* Get daily nutrition for a user */
router.get("/daily/:userId/:date", async (req, res) => {
    try {
        const logs = await NutritionLog.find({
            userId: req.params.userId,
            date: req.params.date
        });
        
        const summary = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            totalFiber: 0,
            meals: {
                Breakfast: [],
                Lunch: [],
                Dinner: [],
                Snack: []
            }
        };

        logs.forEach(log => {
            summary.totalCalories += log.nutrition.calories;
            summary.totalProtein += log.nutrition.protein;
            summary.totalCarbs += log.nutrition.carbs;
            summary.totalFats += log.nutrition.fats;
            summary.totalFiber += log.nutrition.fiber;
            summary.meals[log.mealType].push(log);
        });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch nutrition data" });
    }
});

/* Get weekly summary */
router.get("/weekly/:userId/:startDate", async (req, res) => {
    try {
        const startDate = new Date(req.params.startDate);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split("T")[0]);
        }

        const logs = await NutritionLog.find({
            userId: req.params.userId,
            date: { $in: dates }
        });

        const dailyData = {};
        dates.forEach(date => {
            dailyData[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        });

        logs.forEach(log => {
            dailyData[log.date].calories += log.nutrition.calories;
            dailyData[log.date].protein += log.nutrition.protein;
            dailyData[log.date].carbs += log.nutrition.carbs;
            dailyData[log.date].fats += log.nutrition.fats;
        });

        res.json(dailyData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weekly data" });
    }
});

/* Log a meal */
router.post("/", async (req, res) => {
    try {
        const log = new NutritionLog(req.body);
        await log.save();
        res.json({ message: "Meal logged successfully", log });
    } catch (error) {
        res.status(400).json({ error: "Failed to log meal" });
    }
});

/* Delete a meal log */
router.delete("/:id", async (req, res) => {
    try {
        await NutritionLog.findByIdAndDelete(req.params.id);
        res.json({ message: "Meal deleted" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete meal" });
    }
});

module.exports = router;
