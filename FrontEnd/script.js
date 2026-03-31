/* =====================================================
   DINING GUIDE - CORE LOGIC
   ===================================================== */

const API_BASE = "https://dining-guide-production.up.railway.app/api";

// ---------------------- AUTH PROTECTION ----------------------
document.addEventListener("DOMContentLoaded", () => {
    const protectedPages = ["restaurants.html", "details.html", "nutrition.html", "favorites.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.replace("login.html");
        }
    }
});

// ---------------------- HEADER SCROLL EFFECT ----------------------
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

// ---------------------- HELPER FUNCTIONS ----------------------
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showError(containerId, message, color = "var(--accent)") {
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

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

// ---------------------- AUTH LOGIC ----------------------
async function validateSignup(event) {
    event.preventDefault();
    clearError("signup-error");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm").value.trim();

    if (!name || !email || !password) return showError("signup-error", "All fields are required");
    if (!isValidEmail(email)) return showError("signup-error", "Invalid email format");
    if (password.length < 6) return showError("signup-error", "Password must be at least 6 characters");
    if (password !== confirmPassword) return showError("signup-error", "Passwords do not match");

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        if (!response.ok) return showError("signup-error", data.error || "Signup failed");
        
        localStorage.setItem("token", data.token);
        if (data.user) {
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userId", data.user.id);
        }
        showError("signup-error", "Account created! Redirecting...", "#4ade80");
        setTimeout(() => window.location.href = "restaurants.html", 1500);
    } catch (error) {
        showError("signup-error", "Server currently offline");
    }
}

async function validateLogin(event) {
    event.preventDefault();
    clearError("login-error");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) return showError("login-error", "Email and password required");

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) return showError("login-error", data.error || "Invalid credentials");

        localStorage.setItem("token", data.token);
        if (data.user) {
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userId", data.user.id);
        }
        showError("login-error", "Welcome back!", "#4ade80");
        setTimeout(() => window.location.href = "restaurants.html", 1000);
    } catch (error) {
        showError("login-error", "Server currently offline");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    window.location.href = "index.html";
}

// ---------------------- RESTAURANTS LIST ----------------------
document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("restaurantList");
    if (!list) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // Check for search query in URL (from home page)
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("search") || "";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = initialQuery;

    try {
        const response = await fetch(`${API_BASE}/restaurants`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const restaurants = await response.json();

        async function renderList(query = "", cuisine = "", rating = "") {
            list.innerHTML = "";
            const filtered = restaurants.filter(r => {
                const matchSearch = r.name.toLowerCase().includes(query.toLowerCase()) || 
                                   r.cuisine.toLowerCase().includes(query.toLowerCase());
                const matchCuisine = cuisine === "" || r.cuisine.toLowerCase() === cuisine.toLowerCase();
                const matchRating = rating === "" || r.rating >= parseInt(rating);
                return matchSearch && matchCuisine && matchRating;
            });

            if (filtered.length === 0) {
                list.innerHTML = `<div class="glass-card animate-fade" style="grid-column: 1/-1">No restaurants found matching your criteria.</div>`;
                return;
            }

            for(const r of filtered) {
                // Check favorite status for each restaurant
                let isFav = false;
                if (userId) {
                    try {
                        const favRes = await fetch(`${API_BASE}/favorites/check/${userId}/${r._id}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        const favData = await favRes.json();
                        isFav = favData.isFavorite;
                    } catch (e) {}
                }

                const card = document.createElement("div");
                card.className = "glass-card restaurant-card animate-fade";
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${r.name}</h3>
                            <p style="color: var(--text-muted)">${r.cuisine} • Rating: ${"⭐".repeat(r.rating)}</p>
                        </div>
                        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleRestaurantFavorite('${r._id}', this)" style="font-size: 1.5rem;">
                            ${isFav ? '❤️' : '♡'}
                        </button>
                    </div>
                    <div style="margin-top: 1.5rem">
                        <a href="details.html?id=${r._id}" class="btn" style="width: 100%; justify-content: center;">View Details</a>
                    </div>
                `;
                list.appendChild(card);
            }
        }

        // Initial render
        renderList(initialQuery);

        // Listen for filter changes
        const cuisineFilter = document.getElementById("cuisineFilter");
        const ratingFilter = document.getElementById("ratingFilter");

        const updateFilters = () => renderList(searchInput.value, cuisineFilter.value, ratingFilter.value);
        
        if (searchInput) searchInput.addEventListener("input", updateFilters);
        if (cuisineFilter) cuisineFilter.addEventListener("change", updateFilters);
        if (ratingFilter) ratingFilter.addEventListener("change", updateFilters);

    } catch (err) {
        list.innerHTML = `<p>Error connecting to backend: ${err.message}</p>`;
    }
});

// ---------------------- FAVORITE LOGIC ----------------------
async function toggleRestaurantFavorite(restaurantId, btn) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
        alert("Please login to add favorites");
        return;
    }

    const isActive = btn.classList.contains("active");

    try {
        if (isActive) {
            await fetch(`${API_BASE}/favorites/${userId}/${restaurantId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            btn.classList.remove("active");
            btn.innerHTML = "♡";
        } else {
            await fetch(`${API_BASE}/favorites`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ userId, restaurantId })
            });
            btn.classList.add("active");
            btn.innerHTML = "❤️";
        }
    } catch (err) {
        console.error("Failed to toggle favorite");
    }
}

// ---------------------- HOME SEARCH REDIRECTION ----------------------
function handleHomeSearch() {
    const input = document.getElementById("homeSearchInput");
    if (input) {
        const query = input.value.trim();
        window.location.href = `restaurants.html?search=${encodeURIComponent(query)}`;
    }
}

// ---------------------- RESTAURANT DETAILS ----------------------
let currentRestaurantId = null;
let currentRating = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const detailsContainer = document.getElementById("restaurantDetails");
    if (!detailsContainer) return;

    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    currentRestaurantId = urlParams.get("id");

    if (!currentRestaurantId) {
        detailsContainer.innerHTML = "<h2>No restaurant ID provided.</h2>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/restaurants/${currentRestaurantId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const rest = await response.json();
        if (!response.ok) throw new Error(rest.error || "Failed to fetch");

        // Set Basic Info
        document.getElementById("restName").textContent = rest.name;
        document.getElementById("restCuisine").textContent = rest.cuisine;
        document.getElementById("restRating").textContent = "⭐".repeat(rest.rating);
        document.getElementById("restAddress").textContent = rest.address || "123 Gourmet Street, Food City";
        document.getElementById("restHours").textContent = rest.hours || "11:00 AM - 10:00 PM";
        document.title = rest.name + " - Dining Guide";

        // Load Menu, Reviews, Favorites
        await loadMenuItems();
        await loadReviews();
        await checkFavoriteStatus();

    } catch (err) {
        detailsContainer.innerHTML = `<h2>Error: ${err.message}</h2>`;
    }
});

async function loadMenuItems() {
    const menuList = document.getElementById("menuList");
    const noMenu = document.getElementById("noMenu");
    if (!menuList) return;

    try {
        const response = await fetch(`${API_BASE}/menu-items/restaurant/${currentRestaurantId}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const items = await response.json();

        if (!items || items.length === 0) {
            menuList.style.display = "none";
            if (noMenu) noMenu.style.display = "block";
            return;
        }

        menuList.style.display = "grid";
        if (noMenu) noMenu.style.display = "none";
        
        menuList.innerHTML = items.map(item => `
            <div class="menu-item animate-fade">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 1.25rem;">${item.name} ${item.isVegetarian ? '🌱' : ''}</h4>
                    <span style="font-weight: 700; color: var(--primary);">₹${item.price || '-'}</span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.description || ''}</p>
                <div class="nutrition-info">
                    <span style="background: rgba(var(--primary-rgb), 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">🔥 ${item.nutrition.calories} cal</span>
                    <span style="background: rgba(var(--secondary-rgb), 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">🥩 ${item.nutrition.protein}g</span>
                    <span style="background: rgba(255, 100, 100, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">🍞 ${item.nutrition.carbs}g</span>
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/reviews/restaurant/${currentRestaurantId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const reviews = await response.json();

        const ratingRes = await fetch(`${API_BASE}/reviews/rating/${currentRestaurantId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const ratingData = await ratingRes.json();

        document.getElementById("avgRating").textContent = ratingData.avgRating || "0";
        document.getElementById("reviewCount").textContent = `${ratingData.count || 0} reviews`;
        
        const avgNum = parseFloat(ratingData.avgRating) || 0;
        document.getElementById("avgStars").textContent = "★".repeat(Math.round(avgNum)) + "☆".repeat(5 - Math.round(avgNum));

        if (!reviews || reviews.length === 0) {
            reviewsList.style.display = "none";
            if (noReviews) noReviews.style.display = "block";
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item animate-fade">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <strong style="font-size: 1.1rem;">${review.userId?.name || 'Anonymous'}</strong>
                    <span style="color: var(--accent);">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                </div>
                <p style="color: var(--text); margin-bottom: 0.5rem;">${review.comment}</p>
                <small style="color: var(--text-muted);">${new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
        `).join("");
        
        reviewsList.style.display = "grid";
        if (noReviews) noReviews.style.display = "none";
    } catch (err) {
        reviewsList.innerHTML = "<p>Unable to load reviews</p>";
    }
}

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
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
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
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
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

async function checkFavoriteStatus() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId || !currentRestaurantId) return;

    try {
        const response = await fetch(`${API_BASE}/favorites/check/${userId}/${currentRestaurantId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
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
        if (icon) icon.textContent = "❤️";
    } else {
        btn.classList.remove("active");
        if (icon) icon.textContent = "♡";
    }
}

async function toggleFavorite() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
        alert("Please login to add favorites");
        return;
    }

    const btn = document.getElementById("favoriteBtn");
    const isActive = btn.classList.contains("active");

    try {
        if (isActive) {
            await fetch(`${API_BASE}/favorites/${userId}/${currentRestaurantId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            updateFavoriteButton(false);
        } else {
            await fetch(`${API_BASE}/favorites`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ userId, restaurantId: currentRestaurantId })
            });
            updateFavoriteButton(true);
        }
    } catch (err) {
        console.error("Failed to toggle favorite");
    }
}

// ---------------------- FAVORITES PAGE ----------------------
document.addEventListener("DOMContentLoaded", async () => {
    const favoritesList = document.getElementById("favoritesList");
    if (!favoritesList) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE}/favorites/user/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const favorites = await response.json();

        if (!favorites || favorites.length === 0) {
            favoritesList.style.display = "none";
            document.getElementById("noFavorites").style.display = "block";
            return;
        }

        favoritesList.innerHTML = favorites.map(fav => {
            const rest = fav.restaurantId;
            if (!rest) return "";
            return `
                <div class="glass-card restaurant-card animate-fade">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${rest.name}</h3>
                            <p style="color: var(--text-muted)">${rest.cuisine} • ⭐${rest.rating}</p>
                        </div>
                        <button class="fav-btn active" onclick="removeFavorite('${rest._id}', this)" style="font-size: 1.5rem;">❤️</button>
                    </div>
                    <div style="margin-top: 1.5rem">
                        <a href="details.html?id=${rest._id}" class="btn" style="width: 100%; justify-content: center;">View Details</a>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        favoritesList.innerHTML = "<p>Unable to load favorites</p>";
    }
});

async function removeFavorite(restaurantId, btn) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    try {
        await fetch(`${API_BASE}/favorites/${userId}/${restaurantId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        btn.closest(".glass-card").remove();
        
        const favoritesList = document.getElementById("favoritesList");
        if (favoritesList && favoritesList.children.length === 0) {
            favoritesList.style.display = "none";
            document.getElementById("noFavorites").style.display = "block";
        }
    } catch (err) {
        console.error("Failed to remove favorite");
    }
}

// ---------------------- NUTRITION TRACKER PAGE ----------------------
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
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE}/nutrition/daily/${userId}/${selectedDate}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
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

    const cp = document.getElementById("caloriesProgress");
    const pp = document.getElementById("proteinProgress");
    const cbp = document.getElementById("carbsProgress");
    const fp = document.getElementById("fatsProgress");

    if (cp) cp.style.width = calPercent + "%";
    if (pp) pp.style.width = protPercent + "%";
    if (cbp) cbp.style.width = carbPercent + "%";
    if (fp) fp.style.width = fatPercent + "%";

    const cper = document.getElementById("caloriesPercent");
    const pper = document.getElementById("proteinPercent");
    if (cper) cper.textContent = Math.round(calPercent) + "%";
    if (pper) pper.textContent = Math.round(protPercent) + "%";
}

async function addMeal(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const name = document.getElementById("mealName").value.trim();
    const calories = parseInt(document.getElementById("mealCalories").value);
    const protein = parseInt(document.getElementById("mealProtein").value) || 0;
    const carbs = parseInt(document.getElementById("mealCarbs").value) || 0;
    const fats = parseInt(document.getElementById("mealFats").value) || 0;
    const type = document.getElementById("mealType").value;

    if (!name || isNaN(calories)) return;

    try {
        const response = await fetch(`${API_BASE}/nutrition`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
                userId,
                date: selectedDate,
                name,
                calories,
                protein,
                carbs,
                fats,
                type
            })
        });

        if (response.ok) {
            document.getElementById("addMealForm").reset();
            loadNutritionData();
        }
    } catch (err) {
        console.error("Failed to add meal");
    }
}

async function deleteMeal(mealId) {
    const token = localStorage.getItem("token");
    try {
        await fetch(`${API_BASE}/nutrition/${mealId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        loadNutritionData();
    } catch (err) {
        console.error("Failed to delete meal");
    }
}

function updateMealLists(meals) {
    const types = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    types.forEach(type => {
        const list = document.getElementById(type.toLowerCase() + "List");
        if (!list) return;

        const filtered = meals.filter(m => m.type === type);
        if (filtered.length === 0) {
            list.innerHTML = `<p class="empty-meal">No ${type.toLowerCase()} logged</p>`;
        } else {
            list.innerHTML = filtered.map(m => `
                <div class="meal-item">
                    <div class="meal-item-info">
                        <strong>${m.name}</strong>
                        <span>${m.calories} cal | P: ${m.protein}g C: ${m.carbs}g F: ${m.fats}g</span>
                    </div>
                    <button class="delete-btn" onclick="deleteMeal('${m._id}')">×</button>
                </div>
            `).join("");
        }
    });
}
