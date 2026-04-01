require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const Restaurant = require('./models/Restaurant');
    const Review = require('./models/Review');
    
    const rests = await Restaurant.find().limit(1);
    const restId = rests[0]._id;
    console.log('Testing Restaurant:', rests[0].name, restId);
    
    // Check all reviews for this restaurant
    const reviews = await Review.find({ restaurantId: restId });
    console.log('Total Reviews in DB:', reviews.length);
    console.log('Reviews:', reviews.map(r => ({ id: r._id, rating: r.rating })));
    
    // Aggregation Test 1: exact query from backend
    try {
        const result = await Review.aggregate([
            { $match: { restaurantId: new mongoose.Types.ObjectId(restId.toString()) } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
        console.log('Aggregation Result 1:', result);
    } catch(err) {
        console.log('Agg Error 1:', err);
    }

    // Aggregation Test 2: without ObjectId cast (just trying to see if it matches)
    try {
        const result2 = await Review.aggregate([
            { $match: { restaurantId: restId } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
        console.log('Aggregation Result 2:', result2);
    } catch(err) {
        console.log('Agg Error 2:', err);
    }

    // Now test adding a review
    console.log('Adding test review...');
    const newRev = new Review({
        userId: new mongoose.Types.ObjectId(), // fake user
        restaurantId: restId,
        rating: 5,
        comment: "Test comment via script"
    });
    await newRev.save();
    console.log('Review saved.');

    // Rerun aggregation
    const result3 = await Review.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restId.toString()) } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    console.log('After insert Aggregation:', result3);
    
    // Cleanup
    await Review.findByIdAndDelete(newRev._id);
    console.log('Cleanup done');
    process.exit(0);
}

test();
