// Sprawdzenie statusu logowania i aktualizacja nawigacji
function checkLoginStatus() {
  fetch("php/check_login.php")
    .then((response) => response.json())
    .then((data) => {
      updateNavigation(data);
    })
    .catch((error) => {
      console.error("Błąd sprawdzania statusu logowania:", error);
    });
}

function updateNavigation(data) {
  const navList = document.querySelector("nav ul");
  const navContainer = document.querySelector("nav .container");
  if (!navList) return;

  if (data.loggedIn) {
    const loginLink = navList.querySelector('a[href="login.html"]');
    const registerLink = navList.querySelector('a[href="register.html"]');

    if (loginLink) {
      loginLink.parentElement.remove();
    }
    if (registerLink) {
      registerLink.parentElement.remove();
    }

    // Dodaj informacje o użytkowniku i link do wylogowania
    const userLi = document.createElement("li");
    userLi.innerHTML = `<span class="user-info">👤 ${data.username}</span>`;

    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `<a href="php/logout.php">Wyloguj</a>`;

    navList.appendChild(userLi);
    navList.appendChild(logoutLi);

    // Dodaj nazwę użytkownika w nagłówku
    const header = document.querySelector("header");
    if (header && !document.querySelector(".header-user-info")) {
      const userHeader = document.createElement("div");
      userHeader.className = "header-user-info";
      userHeader.innerHTML = `<span>Witaj, <strong>${data.username}</strong>!</span>`;
      header.appendChild(userHeader);
    }
  }
}

// Sprawdzenie statusu logowania przy ładowaniu strony
document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
});

// Logowanie
document.getElementById("loginForm").addEventListener("submit", function (e) {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    e.preventDefault();
    alert("Proszę wypełnij wszystkie rubryki.");
    return;
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document
      .getElementById("confirm_password")
      .value.trim();

    if (!username || !email || !password || !confirmPassword) {
      e.preventDefault();
      alert("Proszę wypełnij wszystkie rubryki.");
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      alert("Nie pasujące hasła.");
      return;
    }

    if (password.length < 6) {
      e.preventDefault();
      alert("Hasło musi posiadac przynajmniej 6 znaków.");
      return;
    }

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      e.preventDefault();
      alert("Niepoprawny email.");
      return;
    }
  });

// Bookowanie
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  const roomType = document.getElementById("room_type").value;
  const checkIn = document.getElementById("check_in").value;
  const checkOut = document.getElementById("check_out").value;

  if (!roomType || !checkIn || !checkOut) {
    e.preventDefault();
    alert("Proszę wypełnij wszystkie rubryki.");
    return;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();

  if (checkInDate < today) {
    e.preventDefault();
    alert("Data zameldowania nie może być w przeszłości.");
    return;
  }

  if (checkOutDate <= checkInDate) {
    e.preventDefault();
    alert("Data wymeldowania musi byc po zameldowaniu.");
    return;
  }
});

document
  .getElementById("check_in")
  .addEventListener("change", updateTotalPrice);
document
  .getElementById("check_out")
  .addEventListener("change", updateTotalPrice);
document
  .getElementById("room_type")
  .addEventListener("change", updateTotalPrice);

function updateTotalPrice() {
  const roomType = document.getElementById("room_type").value;
  const checkIn = document.getElementById("check_in").value;
  const checkOut = document.getElementById("check_out").value;

  if (!roomType || !checkIn || !checkOut) return;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );

  let pricePerNight = 0;
  switch (roomType) {
    case "Single":
      pricePerNight = 400;
      break;
    case "Double":
      pricePerNight = 600;
      break;
    case "Suite":
      pricePerNight = 1000;
      break;
    case "Family":
      pricePerNight = 800;
      break;
  }

  const totalPrice = nights * pricePerNight;

  // Wyświetl całkowitą cenę
  const totalElement = document.getElementById("total-price");
  if (totalElement) {
    totalElement.textContent = `Total: $${totalPrice}`;
  }
}
