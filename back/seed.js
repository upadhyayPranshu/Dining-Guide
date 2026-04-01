const mongoose = require("mongoose");
require("dotenv").config();
const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");

const restaurants = [
    {
        name: "Spice Hub",
        cuisine: "Indian",
        rating: 4,
        address: "123 Curry Lane, Food City",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
    },
    {
        name: "Sushi Zen",
        cuisine: "Japanese",
        rating: 5,
        address: "456 Sakura Street, Downtown",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80"
    },
    {
        name: "The Pasta Project",
        cuisine: "Italian",
        rating: 5,
        address: "789 Olive Grove, Uptown",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80"
    },
    {
        name: "Burger Haven",
        cuisine: "American",
        rating: 4,
        address: "101 Grill Road, Westside",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80"
    },
    {
        name: "Taco Town",
        cuisine: "Mexican",
        rating: 3,
        address: "202 Salsa Blvd, Eastside",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80"
    },
    {
        name: "Le Bistro",
        cuisine: "French",
        rating: 5,
        address: "303 Baguette Way, Central",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
    }
];

// Menu items mapped by restaurant name
const menuItemsByRestaurant = {
    "Spice Hub": [
        { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken pieces", price: 320, category: "Main Course", isVegetarian: false, nutrition: { calories: 490, protein: 32, carbs: 18, fats: 28, fiber: 3 } },
        { name: "Paneer Tikka Masala", description: "Grilled cottage cheese cubes in a spiced gravy", price: 280, category: "Main Course", isVegetarian: true, nutrition: { calories: 380, protein: 18, carbs: 22, fats: 24, fiber: 4 } },
        { name: "Garlic Naan", description: "Soft flatbread topped with fresh garlic and butter", price: 60, category: "Side", isVegetarian: true, nutrition: { calories: 260, protein: 7, carbs: 42, fats: 6, fiber: 2 } },
        { name: "Samosa (2 pcs)", description: "Crispy pastry filled with spiced potatoes and peas", price: 90, category: "Appetizer", isVegetarian: true, nutrition: { calories: 310, protein: 6, carbs: 38, fats: 14, fiber: 4 } },
        { name: "Mango Lassi", description: "Chilled yogurt drink blended with sweet Alphonso mangoes", price: 120, category: "Beverage", isVegetarian: true, nutrition: { calories: 180, protein: 5, carbs: 34, fats: 3, fiber: 1 } },
        { name: "Gulab Jamun", description: "Soft milk-solid balls soaked in rose-scented sugar syrup", price: 100, category: "Dessert", isVegetarian: true, nutrition: { calories: 340, protein: 4, carbs: 56, fats: 12, fiber: 0 } }
    ],
    "Sushi Zen": [
        { name: "Dragon Roll", description: "Eel and cucumber roll topped with sliced avocado", price: 450, category: "Main Course", isVegetarian: false, nutrition: { calories: 350, protein: 18, carbs: 42, fats: 12, fiber: 3 } },
        { name: "Salmon Nigiri (4 pcs)", description: "Fresh Atlantic salmon over pressed vinegared rice", price: 380, category: "Main Course", isVegetarian: false, nutrition: { calories: 280, protein: 22, carbs: 32, fats: 8, fiber: 1 } },
        { name: "Edamame", description: "Steamed young soybeans with sea salt", price: 150, category: "Appetizer", isVegetarian: true, nutrition: { calories: 120, protein: 12, carbs: 9, fats: 5, fiber: 4 } },
        { name: "Miso Soup", description: "Traditional fermented soybean soup with tofu and seaweed", price: 120, category: "Side", isVegetarian: true, nutrition: { calories: 60, protein: 5, carbs: 6, fats: 2, fiber: 1 } },
        { name: "Tempura Udon", description: "Thick wheat noodles in dashi broth with crispy tempura shrimp", price: 340, category: "Main Course", isVegetarian: false, nutrition: { calories: 420, protein: 20, carbs: 58, fats: 14, fiber: 3 } },
        { name: "Matcha Ice Cream", description: "Premium Japanese green tea ice cream", price: 160, category: "Dessert", isVegetarian: true, nutrition: { calories: 220, protein: 4, carbs: 28, fats: 10, fiber: 1 } }
    ],
    "The Pasta Project": [
        { name: "Spaghetti Carbonara", description: "Classic Roman pasta with egg, pecorino, guanciale and black pepper", price: 360, category: "Main Course", isVegetarian: false, nutrition: { calories: 520, protein: 24, carbs: 58, fats: 22, fiber: 3 } },
        { name: "Margherita Pizza", description: "Wood-fired pizza with San Marzano tomatoes, fresh mozzarella and basil", price: 320, category: "Main Course", isVegetarian: true, nutrition: { calories: 680, protein: 28, carbs: 72, fats: 26, fiber: 4 } },
        { name: "Bruschetta al Pomodoro", description: "Toasted ciabatta with diced tomatoes, garlic, basil and olive oil", price: 180, category: "Appetizer", isVegetarian: true, nutrition: { calories: 220, protein: 6, carbs: 28, fats: 10, fiber: 3 } },
        { name: "Tiramisu", description: "Layered espresso-soaked ladyfingers with mascarpone cream", price: 220, category: "Dessert", isVegetarian: true, nutrition: { calories: 380, protein: 6, carbs: 42, fats: 20, fiber: 0 } },
        { name: "Penne Arrabbiata", description: "Penne pasta in a fiery tomato sauce with red chili flakes", price: 280, category: "Main Course", isVegetarian: true, nutrition: { calories: 410, protein: 14, carbs: 62, fats: 12, fiber: 5 } }
    ],
    "Burger Haven": [
        { name: "Classic Smash Burger", description: "Double smashed beef patties with American cheese, pickles and special sauce", price: 280, category: "Main Course", isVegetarian: false, nutrition: { calories: 720, protein: 42, carbs: 38, fats: 44, fiber: 2 } },
        { name: "BBQ Bacon Burger", description: "Angus beef patty with smoked bacon, cheddar, onion rings and BBQ glaze", price: 340, category: "Main Course", isVegetarian: false, nutrition: { calories: 850, protein: 48, carbs: 46, fats: 52, fiber: 3 } },
        { name: "Loaded Fries", description: "Crispy fries topped with cheese sauce, jalapeños and bacon bits", price: 180, category: "Side", isVegetarian: false, nutrition: { calories: 480, protein: 14, carbs: 52, fats: 26, fiber: 4 } },
        { name: "Veggie Beyond Burger", description: "Plant-based patty with lettuce, tomato, avocado and vegan mayo", price: 300, category: "Main Course", isVegetarian: true, nutrition: { calories: 560, protein: 28, carbs: 44, fats: 30, fiber: 6 } },
        { name: "Oreo Milkshake", description: "Thick vanilla shake blended with crushed Oreo cookies", price: 180, category: "Beverage", isVegetarian: true, nutrition: { calories: 520, protein: 10, carbs: 68, fats: 24, fiber: 1 } }
    ],
    "Taco Town": [
        { name: "Carne Asada Tacos (3 pcs)", description: "Grilled steak tacos with cilantro, onion, and salsa verde", price: 260, category: "Main Course", isVegetarian: false, nutrition: { calories: 450, protein: 32, carbs: 36, fats: 18, fiber: 4 } },
        { name: "Chicken Quesadilla", description: "Flour tortilla stuffed with seasoned chicken and melted cheese", price: 220, category: "Main Course", isVegetarian: false, nutrition: { calories: 520, protein: 30, carbs: 38, fats: 26, fiber: 2 } },
        { name: "Guacamole & Chips", description: "Fresh smashed avocado with lime, cilantro, and crispy tortilla chips", price: 150, category: "Appetizer", isVegetarian: true, nutrition: { calories: 320, protein: 4, carbs: 28, fats: 22, fiber: 8 } },
        { name: "Churros with Chocolate", description: "Crispy cinnamon sugar churros with warm chocolate dipping sauce", price: 140, category: "Dessert", isVegetarian: true, nutrition: { calories: 380, protein: 4, carbs: 52, fats: 18, fiber: 2 } },
        { name: "Horchata", description: "Traditional Mexican rice milk drink with cinnamon and vanilla", price: 100, category: "Beverage", isVegetarian: true, nutrition: { calories: 160, protein: 2, carbs: 32, fats: 4, fiber: 0 } }
    ],
    "Le Bistro": [
        { name: "Coq au Vin", description: "Braised chicken in Burgundy wine with mushrooms and pearl onions", price: 520, category: "Main Course", isVegetarian: false, nutrition: { calories: 580, protein: 38, carbs: 16, fats: 32, fiber: 3 } },
        { name: "French Onion Soup", description: "Rich beef broth with caramelized onions, topped with Gruyère crouton", price: 240, category: "Appetizer", isVegetarian: false, nutrition: { calories: 310, protein: 14, carbs: 28, fats: 16, fiber: 3 } },
        { name: "Duck Confit", description: "Slow-cooked duck leg with crispy skin, served with roasted potatoes", price: 580, category: "Main Course", isVegetarian: false, nutrition: { calories: 640, protein: 34, carbs: 22, fats: 42, fiber: 2 } },
        { name: "Crème Brûlée", description: "Silky vanilla custard with a caramelized sugar crust", price: 220, category: "Dessert", isVegetarian: true, nutrition: { calories: 320, protein: 5, carbs: 38, fats: 16, fiber: 0 } },
        { name: "Ratatouille", description: "Provençal vegetable medley with eggplant, zucchini, and tomatoes", price: 340, category: "Main Course", isVegetarian: true, nutrition: { calories: 240, protein: 6, carbs: 28, fats: 12, fiber: 8 } },
        { name: "Café au Lait", description: "Rich French-press coffee with steamed milk", price: 120, category: "Beverage", isVegetarian: true, nutrition: { calories: 80, protein: 4, carbs: 8, fats: 4, fiber: 0 } }
    ]
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas for seeding...");

        // Clear existing data
        await Restaurant.deleteMany({});
        await MenuItem.deleteMany({});
        console.log("Cleared existing restaurants and menu items.");

        // Insert restaurants
        const insertedRestaurants = await Restaurant.insertMany(restaurants);
        console.log(`Seeded ${insertedRestaurants.length} restaurants.`);

        // Insert menu items for each restaurant
        let totalItems = 0;
        for (const rest of insertedRestaurants) {
            const items = menuItemsByRestaurant[rest.name];
            if (items) {
                const withId = items.map(item => ({ ...item, restaurantId: rest._id }));
                await MenuItem.insertMany(withId);
                totalItems += withId.length;
                console.log(`  → ${rest.name}: ${withId.length} menu items`);
            }
        }
        console.log(`Seeded ${totalItems} menu items total!`);

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("Error seeding database:", error.message);
        process.exit(1);
    }
};

seedDB();
