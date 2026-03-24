/* =====================================================
   LOGIN SESSION CHECK
   ===================================================== */

/* =====================================================
   AUTH PROTECTION SYSTEM
   ===================================================== */

const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {

    const protectedPages = ["restaurants.html", "details.html", "nutrition.html", "favorites.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (!isLoggedIn) {
            window.location.replace("login.html");
        }
    }
});



/* =====================================================
   DINING GUIDE - HELPER FUNCTIONS
   ===================================================== */

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showError(containerId, message, color = "red") {
    const box = document.getElementById(containerId);
    if (box) {
        box.textContent = message;
        box.style.color = color;
        box.style.marginTop = "10px";
    }
}

function clearError(containerId) {
    const box = document.getElementById(containerId);
    if (box) box.textContent = "";
}

function getUserId() {
    return localStorage.getItem("userId");
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

/* =====================================================
   SIGNUP → BACKEND
   ===================================================== */

async function validateSignup(event) {
    event.preventDefault();
    clearError("signup-error");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm").value.trim();

    if (!name || !email || !password) {
        showError("signup-error", "All fields are required");
        return;
    }

    if (!isValidEmail(email)) {
        showError("signup-error", "Invalid email format");
        return;
    }

    if (password.length < 6) {
        showError("signup-error", "Password must be at least 6 characters");
        return;
    }

    if (password !== confirmPassword) {
        showError("signup-error", "Passwords do not match");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError("signup-error", data.error || "Signup failed");
            return;
        }

        showError("signup-error", "Signup successful ✔ Redirecting...", "green");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        console.error("Login error:", error);
        showError("signup-error", "Backend server not reachable");
    }
}

/* =====================================================
   LOGIN → BACKEND
   ===================================================== */

async function validateLogin(event) {
    event.preventDefault();
    clearError("login-error");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        showError("login-error", "Email and password required");
        return;
    }

    try {
        console.log("Attempting login to:", `${API_BASE}/auth/login`);
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
        alert("Response: " + JSON.stringify(data));

        if (!response.ok) {
            showError("login-error", data.error || "Invalid credentials");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");
        if (data.user) {
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userName", data.user.name);
        }
        
        console.log("Stored userId:", localStorage.getItem("userId"));

        showError("login-error", "Login successful ✔", "green");

        setTimeout(() => {
            window.location.href = "restaurants.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);
        showError("login-error", "Backend server not reachable");
    }
}

/* =====================================================
   FETCH RESTAURANTS FROM BACKEND
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const restaurantList = document.getElementById("restaurantList");
    if (!restaurantList) return;

    try {
        const response = await fetch(`${API_BASE}/restaurants`);
        const restaurants = await response.json();
        const userId = getUserId();

        restaurantList.innerHTML = "";

        for (const rest of restaurants) {
            let isFav = false;
            if (userId) {
                try {
                    const favRes = await fetch(`${API_BASE}/favorites/check/${userId}/${rest._id}`);
                    const favData = await favRes.json();
                    isFav = favData.isFavorite;
                } catch (e) {}
            }

            const card = document.createElement("div");
            card.className = "card restaurant";

            card.dataset.id = rest._id;
            card.dataset.name = rest.name.toLowerCase();
            card.dataset.cuisine = rest.cuisine.toLowerCase();
            card.dataset.rating = rest.rating;

            card.innerHTML = `
                <div class="card-header">
                    <h3>${rest.name}</h3>
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleRestaurantFavorite('${rest._id}', this)">
                        ${isFav ? '❤️' : '♡'}
                    </button>
                </div>
                <p>${rest.cuisine} • ${"⭐".repeat(rest.rating)}</p>
                <br>
                <a href="details.html?id=${rest._id}" class="btn">View Details</a>
            `;

            restaurantList.appendChild(card);
        }

    } catch (err) {
        restaurantList.innerHTML = "<p>Unable to load restaurants</p>";
    }
});

/* =====================================================
   TOGGLE FAVORITE ON RESTAURANT LIST
   ===================================================== */

async function toggleRestaurantFavorite(restaurantId, btn) {
    const userId = getUserId();
    if (!userId) {
        alert("Please login to add favorites");
        return;
    }

    const isActive = btn.classList.contains("active");

    try {
        if (isActive) {
            await fetch(`${API_BASE}/favorites/${userId}/${restaurantId}`, {
                method: "DELETE"
            });
            btn.classList.remove("active");
            btn.innerHTML = "♡";
        } else {
            await fetch(`${API_BASE}/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, restaurantId })
            });
            btn.classList.add("active");
            btn.innerHTML = "❤️";
        }
    } catch (err) {
        console.error("Failed to toggle favorite");
    }
}

/* =====================================================
   SEARCH & FILTER
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchInput");
    const cuisineFilter = document.getElementById("cuisineFilter");
    const ratingFilter = document.getElementById("ratingFilter");

    if (!searchInput || !cuisineFilter || !ratingFilter) return;

    function filterRestaurants() {
        const searchValue = searchInput.value.toLowerCase();
        const cuisineValue = cuisineFilter.value.toLowerCase();
        const ratingValue = ratingFilter.value;

        const restaurants = document.querySelectorAll(".restaurant");

        restaurants.forEach(rest => {
            const name = rest.dataset.name;
            const cuisine = rest.dataset.cuisine;
            const rating = rest.dataset.rating;

            const matchSearch =
                name.includes(searchValue) || cuisine.includes(searchValue);

            const matchCuisine =
                cuisineValue === "" || cuisine === cuisineValue;

            const matchRating =
                ratingValue === "" || rating >= ratingValue;

            rest.style.display =
                matchSearch && matchCuisine && matchRating ? "block" : "none";
        });
    }

    searchInput.addEventListener("input", filterRestaurants);
    cuisineFilter.addEventListener("change", filterRestaurants);
    ratingFilter.addEventListener("change", filterRestaurants);
});

/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}

/* =====================================================
   RESTAURANT DETAILS PAGE
   ===================================================== */

let currentRestaurantId = null;
let currentRating = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const restaurantName = document.getElementById("restaurantName");
    if (!restaurantName) return;

    const urlParams = new URLSearchParams(window.location.search);
    currentRestaurantId = urlParams.get("id");

    if (!currentRestaurantId) {
        restaurantName.textContent = "Restaurant not found";
        return;
    }

    await loadRestaurantDetails();
    await loadMenuItems();
    await loadReviews();
    await checkFavoriteStatus();
});

async function loadRestaurantDetails() {
    try {
        const response = await fetch(`${API_BASE}/restaurants/${currentRestaurantId}`);
        const restaurant = await response.json();

        document.getElementById("restaurantName").textContent = restaurant.name;
        document.getElementById("restaurantCuisine").textContent = restaurant.cuisine;
        document.getElementById("restaurantRating").textContent = "⭐".repeat(restaurant.rating);
        document.getElementById("restaurantAddress").textContent = restaurant.address || "Address not available";
        document.title = restaurant.name + " - Dining Guide";
    } catch (err) {
        console.error("Failed to load restaurant details");
    }
}

async function loadMenuItems() {
    const menuList = document.getElementById("menuList");
    const noMenu = document.getElementById("noMenu");
    if (!menuList) return;

    try {
        const response = await fetch(`${API_BASE}/menu-items/restaurant/${currentRestaurantId}`);
        const items = await response.json();

        if (items.length === 0) {
            menuList.style.display = "none";
            noMenu.style.display = "block";
            return;
        }

        menuList.innerHTML = items.map(item => `
            <div class="menu-item">
                <div class="menu-item-header">
                    <h4>${item.name} ${item.isVegetarian ? '🌱' : ''}</h4>
                    <span class="price">₹${item.price || '-'}</span>
                </div>
                <p class="menu-desc">${item.description || ''}</p>
                <div class="nutrition-info">
                    <span>🔥 ${item.nutrition.calories} cal</span>
                    <span>🥩 ${item.nutrition.protein}g protein</span>
                    <span>🍞 ${item.nutrition.carbs}g carbs</span>
                    <span>🧈 ${item.nutrition.fats}g fats</span>
                </div>
            </div>
        `).join("");
    } catch (err) {
        menuList.innerHTML = "<p>Unable to load menu</p>";
    }
}

async function loadReviews() {
    const reviewsList = document.getElementById("reviewsList");
    const noReviews = document.getElementById("noReviews");
    if (!reviewsList) return;

    try {
        const response = await fetch(`${API_BASE}/reviews/restaurant/${currentRestaurantId}`);
        const reviews = await response.json();

        const ratingRes = await fetch(`${API_BASE}/reviews/rating/${currentRestaurantId}`);
        const ratingData = await ratingRes.json();

        document.getElementById("avgRating").textContent = ratingData.avgRating || "0";
        document.getElementById("reviewCount").textContent = `${ratingData.count || 0} reviews`;
        
        const avgNum = parseFloat(ratingData.avgRating) || 0;
        document.getElementById("avgStars").textContent = "★".repeat(Math.round(avgNum)) + "☆".repeat(5 - Math.round(avgNum));

        if (reviews.length === 0) {
            reviewsList.style.display = "none";
            noReviews.style.display = "block";
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <strong>${review.userId?.name || 'Anonymous'}</strong>
                    <span class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                </div>
                <p>${review.comment}</p>
                <small>${new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
        `).join("");
        
        reviewsList.style.display = "block";
        noReviews.style.display = "none";
    } catch (err) {
        reviewsList.innerHTML = "<p>Unable to load reviews</p>";
    }
}

/* Star Rating for Review Form */
function setRating(rating) {
    currentRating = rating;
    document.getElementById("ratingValue").value = rating;
    const stars = document.querySelectorAll("#starRating span");
    stars.forEach((star, index) => {
        star.textContent = index < rating ? "★" : "☆";
        star.classList.toggle("selected", index < rating);
    });
}

async function submitReview(event) {
    event.preventDefault();
    const userId = getUserId();
    
    if (!userId) {
        showError("reviewError", "Please login to submit a review");
        return;
    }

    const rating = parseInt(document.getElementById("ratingValue").value);
    const comment = document.getElementById("reviewComment").value.trim();

    if (!rating || rating < 1) {
        showError("reviewError", "Please select a rating");
        return;
    }

    if (!comment) {
        showError("reviewError", "Please write a comment");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                restaurantId: currentRestaurantId,
                rating,
                comment
            })
        });

        if (response.ok) {
            document.getElementById("reviewComment").value = "";
            setRating(0);
            await loadReviews();
            showError("reviewError", "Review submitted! ✔", "green");
        }
    } catch (err) {
        showError("reviewError", "Failed to submit review");
    }
}

/* Favorite Toggle on Details Page */
async function checkFavoriteStatus() {
    const userId = getUserId();
    if (!userId || !currentRestaurantId) return;

    try {
        const response = await fetch(`${API_BASE}/favorites/check/${userId}/${currentRestaurantId}`);
        const data = await response.json();
        updateFavoriteButton(data.isFavorite);
    } catch (err) {}
}

function updateFavoriteButton(isFavorite) {
    const btn = document.getElementById("favoriteBtn");
    const icon = document.getElementById("favoriteIcon");
    if (!btn) return;

    if (isFavorite) {
        btn.classList.add("active");
        icon.textContent = "❤️";
    } else {
        btn.classList.remove("active");
        icon.textContent = "♡";
    }
}

async function toggleFavorite() {
    const userId = getUserId();
    if (!userId) {
        alert("Please login to add favorites");
        return;
    }

    const btn = document.getElementById("favoriteBtn");
    const isActive = btn.classList.contains("active");

    try {
        if (isActive) {
            await fetch(`${API_BASE}/favorites/${userId}/${currentRestaurantId}`, {
                method: "DELETE"
            });
            updateFavoriteButton(false);
        } else {
            await fetch(`${API_BASE}/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, restaurantId: currentRestaurantId })
            });
            updateFavoriteButton(true);
        }
    } catch (err) {
        console.error("Failed to toggle favorite");
    }
}

/* =====================================================
   FAVORITES PAGE
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const favoritesList = document.getElementById("favoritesList");
    if (!favoritesList) return;

    const userId = getUserId();
    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE}/favorites/user/${userId}`);
        const favorites = await response.json();

        if (favorites.length === 0) {
            favoritesList.style.display = "none";
            document.getElementById("noFavorites").style.display = "block";
            return;
        }

        favoritesList.innerHTML = favorites.map(fav => {
            const rest = fav.restaurantId;
            if (!rest) return "";
            return `
                <div class="card restaurant">
                    <div class="card-header">
                        <h3>${rest.name}</h3>
                        <button class="fav-btn active" onclick="removeFavorite('${rest._id}', this)">❤️</button>
                    </div>
                    <p>${rest.cuisine} • ${"⭐".repeat(rest.rating)}</p>
                    <br>
                    <a href="details.html?id=${rest._id}" class="btn">View Details</a>
                </div>
            `;
        }).join("");
    } catch (err) {
        favoritesList.innerHTML = "<p>Unable to load favorites</p>";
    }
});

async function removeFavorite(restaurantId, btn) {
    const userId = getUserId();
    try {
        await fetch(`${API_BASE}/favorites/${userId}/${restaurantId}`, {
            method: "DELETE"
        });
        btn.closest(".card").remove();
        
        const favoritesList = document.getElementById("favoritesList");
        if (favoritesList && favoritesList.children.length === 0) {
            favoritesList.style.display = "none";
            document.getElementById("noFavorites").style.display = "block";
        }
    } catch (err) {
        console.error("Failed to remove favorite");
    }
}

/* =====================================================
   NUTRITION TRACKER PAGE
   ===================================================== */

let selectedDate = getTodayDate();

document.addEventListener("DOMContentLoaded", () => {
    const currentDateEl = document.getElementById("currentDate");
    if (!currentDateEl) return;

    updateDateDisplay();
    loadNutritionData();
});

function updateDateDisplay() {
    const el = document.getElementById("currentDate");
    if (!el) return;

    const date = new Date(selectedDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = date.toLocaleDateString('en-US', options);
}

function changeDate(days) {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    selectedDate = date.toISOString().split("T")[0];
    updateDateDisplay();
    loadNutritionData();
}

async function loadNutritionData() {
    const userId = getUserId();
    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE}/nutrition/daily/${userId}/${selectedDate}`);
        const data = await response.json();

        document.getElementById("totalCalories").textContent = data.totalCalories;
        document.getElementById("totalProtein").textContent = data.totalProtein + "g";
        document.getElementById("totalCarbs").textContent = data.totalCarbs + "g";
        document.getElementById("totalFats").textContent = data.totalFats + "g";

        updateProgressBars(data);
        updateMealLists(data.meals);
    } catch (err) {
        console.error("Failed to load nutrition data");
    }
}

function updateProgressBars(data) {
    const goals = { calories: 2000, protein: 50, carbs: 250, fats: 65 };

    const calPercent = Math.min((data.totalCalories / goals.calories) * 100, 100);
    const protPercent = Math.min((data.totalProtein / goals.protein) * 100, 100);
    const carbPercent = Math.min((data.totalCarbs / goals.carbs) * 100, 100);
    const fatPercent = Math.min((data.totalFats / goals.fats) * 100, 100);

    document.getElementById("caloriesProgress").style.width = calPercent + "%";
    document.getElementById("proteinProgress").style.width = protPercent + "%";
    document.getElementById("carbsProgress").style.width = carbPercent + "%";
    document.getElementById("fatsProgress").style.width = fatPercent + "%";

    document.getElementById("caloriesPercent").textContent = Math.round(calPercent) + "%";
    document.getElementById("proteinPercent").textContent = Math.round(protPercent) + "%";
    document.getElementById("carbsPercent").textContent = Math.round(carbPercent) + "%";
    document.getElementById("fatsPercent").textContent = Math.round(fatPercent) + "%";
}

function updateMealLists(meals) {
    const mealTypes = {
        Breakfast: "breakfastList",
        Lunch: "lunchList",
        Dinner: "dinnerList",
        Snack: "snackList"
    };

    for (const [type, listId] of Object.entries(mealTypes)) {
        const list = document.getElementById(listId);
        if (!list) continue;

        const items = meals[type] || [];
        
        if (items.length === 0) {
            list.innerHTML = '<p class="empty-meal">No items logged</p>';
        } else {
            list.innerHTML = items.map(item => `
                <div class="meal-item">
                    <div class="meal-item-info">
                        <strong>${item.foodName}</strong>
                        <span>${item.nutrition.calories} cal</span>
                    </div>
                    <button class="delete-btn" onclick="deleteMeal('${item._id}')">×</button>
                </div>
            `).join("");
        }
    }
}

async function logMeal(event) {
    event.preventDefault();
    const userId = getUserId();
    if (!userId) {
        alert("Please login to log meals");
        return;
    }

    const mealType = document.getElementById("mealType").value;
    const foodName = document.getElementById("foodName").value.trim();
    const calories = parseInt(document.getElementById("inputCalories").value) || 0;
    const protein = parseInt(document.getElementById("inputProtein").value) || 0;
    const carbs = parseInt(document.getElementById("inputCarbs").value) || 0;
    const fats = parseInt(document.getElementById("inputFats").value) || 0;

    try {
        await fetch(`${API_BASE}/nutrition`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                date: selectedDate,
                mealType,
                foodName,
                nutrition: { calories, protein, carbs, fats, fiber: 0 }
            })
        });

        document.getElementById("mealForm").reset();
        loadNutritionData();
    } catch (err) {
        console.error("Failed to log meal");
    }
}

async function deleteMeal(mealId) {
    try {
        await fetch(`${API_BASE}/nutrition/${mealId}`, {
            method: "DELETE"
        });
        loadNutritionData();
    } catch (err) {
        console.error("Failed to delete meal");
    }
}