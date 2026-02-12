/* =====================================================
   LOGIN SESSION CHECK
   ===================================================== */

/* =====================================================
   AUTH PROTECTION SYSTEM
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const protectedPages = ["restaurants.html", "details.html"];
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
        const response = await fetch("http://localhost:5000/api/auth/signup", {
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
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError("login-error", data.error || "Invalid credentials");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");

        showError("login-error", "Login successful ✔", "green");

        setTimeout(() => {
            window.location.href = "restaurants.html";
        }, 1000);

    } catch (error) {
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
        const response = await fetch("http://localhost:5000/api/restaurants");
        const restaurants = await response.json();

        restaurantList.innerHTML = "";

        restaurants.forEach(rest => {
            const card = document.createElement("div");
            card.className = "card restaurant";

            card.dataset.name = rest.name.toLowerCase();
            card.dataset.cuisine = rest.cuisine.toLowerCase();
            card.dataset.rating = rest.rating;

            card.innerHTML = `
                <h3>${rest.name}</h3>
                <p>${rest.cuisine} • ⭐${"⭐".repeat(rest.rating)}</p>
                <br>
                <a href="details.html" class="btn">View Details</a>
            `;

            restaurantList.appendChild(card);
        });

    } catch (err) {
        restaurantList.innerHTML = "<p>Unable to load restaurants</p>";
    }
});

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
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}