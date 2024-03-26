import { gameContainer } from "./misc.js";
import { playerId, playerElements } from "./playerData.js";

// Global variables for pizza position
let pizzaX = 7; // Initial x position
let pizzaY = 7; // Initial y position

// Global variables for cofee position
let coffeeX = 7; // Initial x position
let coffeeY = 7; // Initial y position

document.addEventListener("DOMContentLoaded", function () {
  // Assuming you have your Firebase setup and placePizza/placeCoffee functions defined as before
  const resetItemsButton = document.getElementById("resetItems");

  resetItemsButton.addEventListener("click", function () {
    // Reset pizza state in Firebase and then re-place pizza
    const pizzaRef = firebase.database().ref("gameState/pizza");
    pizzaRef.once("value").then((snapshot) => {
      const pizzaState = snapshot.val();
      if (pizzaState && pizzaState.pickedUp) {
        pizzaRef.set({ pickedUp: false, by: null }).then(() => {
          placePizza(); // Re-place pizza on the screen
          // Hide pizza icons for all players
          Object.keys(playerElements).forEach((playerId) => {
            const pizzaIcon = playerElements[playerId].querySelector(
              ".Character_pizza-icon"
            );
            if (pizzaIcon) {
              pizzaIcon.style.display = "none";
            }
          });
        });
      }
    });

    // Reset coffee state in Firebase and then re-place coffee
    const coffeeRef = firebase.database().ref("gameState/coffee");
    coffeeRef.once("value").then((snapshot) => {
      const coffeeState = snapshot.val();
      if (coffeeState && coffeeState.pickedUp) {
        coffeeRef.set({ pickedUp: false, by: null }).then(() => {
          placeCoffee(); // Re-place coffee on the screen
          // Hide coffee icons for all players
          Object.keys(playerElements).forEach((playerId) => {
            const coffeeIcon = playerElements[playerId].querySelector(
              ".Character_coffee-icon"
            );
            if (coffeeIcon) {
              coffeeIcon.style.display = "none";
            }
          });
        });
      }
    });
  });

  // Your existing code to initialize the game, handle Firebase auth, etc.
});

// Adjusted function to place pizza only if not picked up
function checkAndPlacePizza() {
  const pizzaRef = firebase.database().ref("gameState/pizza");
  pizzaRef.once("value", (snapshot) => {
    const pizzaState = snapshot.val();
    if (!pizzaState || !pizzaState.pickedUp) {
      placePizza();
    }
  });
}

// Adjusted function to place coffee only if not picked up
function checkAndPlaceCoffee() {
  const coffeeRef = firebase.database().ref("gameState/coffee");
  coffeeRef.once("value", (snapshot) => {
    const coffeeState = snapshot.val();
    if (!coffeeState || !coffeeState.pickedUp) {
      placeCoffee();
    }
  });
}

// Call these functions instead of directly calling placePizza() and placeCoffee()
checkAndPlacePizza();
checkAndPlaceCoffee();

function placePizza() {
  // First, remove any existing pizza element
  const existingPizzaElement = document.querySelector(".Pizza");
  if (existingPizzaElement) {
    gameContainer.removeChild(existingPizzaElement);
  }

  pizzaX = 11;
  pizzaY = 4;

  // Create the DOM Element for pizza
  const pizzaElement = document.createElement("div");
  pizzaElement.classList.add("Pizza", "grid-cell");
  pizzaElement.innerHTML = `<div class="Pizza_sprite grid-cell"></div>`;

  // Position the Element using your grid size (16x16 pixels assumed)
  const left = 16 * pizzaX + "px";
  const top = 16 * pizzaY + "px";
  pizzaElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  // Add to DOM
  gameContainer.appendChild(pizzaElement);
}

export function attemptGrabPizza(x, y) {
  if (x === pizzaX && y === pizzaY) {
    // Update Firebase to indicate pizza has been picked up
    const pizzaRef = firebase.database().ref("gameState/pizza");
    pizzaRef.set({ pickedUp: true, by: playerId });

    // Show the pizza icon next to the player's name
    const playerElement = playerElements[playerId];
    if (playerElement) {
      const pizzaIcon = playerElement.querySelector(".Character_pizza-icon");
      if (pizzaIcon) {
        pizzaIcon.style.display = "inline"; // Make the pizza icon visible
      }
    }
  }
}

const pizzaRef = firebase.database().ref("gameState/pizza");
pizzaRef.on("value", (snapshot) => {
  const pizzaState = snapshot.val();
  if (pizzaState && pizzaState.pickedUp) {
    removePizza(); // Adjust this function to work when called in this context
  }
});

function removePizza() {
  const pizzaElement = document.querySelector(".Pizza");
  if (pizzaElement) {
    gameContainer.removeChild(pizzaElement); // Remove the pizza element from its parent container
  }
}
function placeCoffee() {
  // First, remove any existing coffee element
  const existingCoffeeElement = document.querySelector(".Coffee");
  if (existingCoffeeElement) {
    gameContainer.removeChild(existingCoffeeElement);
  }

  coffeeX = 3;
  coffeeY = 4;

  // Create the DOM Element for coffee
  const coffeeElement = document.createElement("div");
  coffeeElement.classList.add("Coffee", "grid-cell");
  coffeeElement.innerHTML = `<div class="Coffee_sprite grid-cell"></div>`;

  // Position the Element using your grid size (16x16 pixels assumed)
  const left = 16 * coffeeX + "px";
  const top = 16 * coffeeY + "px";
  coffeeElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  // Add to DOM
  gameContainer.appendChild(coffeeElement);
}

export function attemptGrabCoffee(x, y) {
  if (x === coffeeX && y === coffeeY) {
    // Update Firebase to indicate coffee has been picked up
    const coffeeRef = firebase.database().ref("gameState/coffee");
    coffeeRef.set({ pickedUp: true, by: playerId });

    // Show the coffee icon next to the player's name
    const playerElement = playerElements[playerId];
    if (playerElement) {
      const coffeeIcon = playerElement.querySelector(".Character_coffee-icon");
      if (coffeeIcon) {
        coffeeIcon.style.display = "inline"; // Make the coffee icon visible
      }
    }
  }
}

const coffeeRef = firebase.database().ref("gameState/coffee");
coffeeRef.on("value", (snapshot) => {
  const coffeeState = snapshot.val();
  if (coffeeState && coffeeState.pickedUp) {
    removeCoffee(); // Adjust this function to work when called in this context
  } else {
    placeCoffee(); // Make sure this doesn't duplicate coffees if called multiple times
  }
});

function removeCoffee() {
  const coffeeElement = document.querySelector(".Coffee");
  if (coffeeElement) {
    gameContainer.removeChild(coffeeElement); // Remove the coffee element from its parent container
  }
}
