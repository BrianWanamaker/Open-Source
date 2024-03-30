import { gameContainer } from "./misc.js";
import { playerId, playerElements, players, playerRef } from "./playerData.js";

let pizzaX = 7;
let pizzaY = 7;

let coffeeX = 7;
let coffeeY = 7;

function checkAndPlacePizza() {
  const pizzaRef = firebase.database().ref("gameState/pizza");
  pizzaRef.once("value", (snapshot) => {
    const pizzaState = snapshot.val();
    if (!pizzaState || !pizzaState.pickedUp) {
      placePizza();
    }
  });
}

function checkAndPlaceCoffee() {
  const coffeeRef = firebase.database().ref("gameState/coffee");
  coffeeRef.once("value", (snapshot) => {
    const coffeeState = snapshot.val();
    if (!coffeeState || !coffeeState.pickedUp) {
      placeCoffee();
    }
  });
}

checkAndPlacePizza();
checkAndPlaceCoffee();

function placePizza() {
  removePizza();
  pizzaX = 11;
  pizzaY = 4;
  const pizzaElement = document.createElement("div");
  pizzaElement.classList.add("Pizza", "grid-cell");
  pizzaElement.innerHTML = `<div class="Pizza_sprite grid-cell"></div>`;
  pizzaElement.style.transform = `translate3d(${16 * pizzaX}px, ${
    16 * pizzaY
  }px, 0)`;
  gameContainer.appendChild(pizzaElement);
}

export function attemptGrabPizza(x, y) {
  if (x === pizzaX && y === pizzaY) {
    if (!playerHasPizza() && !playerHasCoffee()) {
      const pizzaRef = firebase.database().ref("gameState/pizza");
      pizzaRef.set(false);
      const playerElement = playerElements[playerId];
      if (playerElement) {
        const pizzaIcon = playerElement.querySelector(".Character_pizza-icon");
        if (pizzaIcon) {
          pizzaIcon.style.display = "inline";
        }
        players[playerId].items = players[playerId].items || {};
        players[playerId].items.pizza = true;
        firebase.database().ref(`players/${playerId}/items/pizza`).set(true);
      }
    } else {
      displayErrorMessage("You can only hold one item at a time!");
    }
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.textContent = message;
  errorMessage.classList.add("error-message");
  document.querySelector(".game-container").appendChild(errorMessage);

  setTimeout(() => {
    errorMessage.remove();
  }, 1500);
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const pizzaRef = firebase.database().ref("gameState/pizza");
pizzaRef.on("value", (snapshot) => {
  if (!snapshot.val()) {
    removePizza();

    setTimeout(() => {
      pizzaRef.set(true);
    }, getRandomDelay(5000, 10000));
  } else {
    placePizza();
  }
});

function removePizza() {
  const pizzaElement = document.querySelector(".Pizza");
  if (pizzaElement && pizzaElement.parentNode) {
    pizzaElement.parentNode.removeChild(pizzaElement);
  }
}

function placeCoffee() {
  removeCoffee();
  coffeeX = 3;
  coffeeY = 4;
  const coffeeElement = document.createElement("div");
  coffeeElement.classList.add("Coffee", "grid-cell");
  coffeeElement.innerHTML = `<div class="Coffee_sprite grid-cell"></div>`;
  coffeeElement.style.transform = `translate3d(${16 * coffeeX}px, ${
    16 * coffeeY
  }px, 0)`;
  gameContainer.appendChild(coffeeElement);
}

export function attemptGrabCoffee(x, y) {
  if (x === coffeeX && y === coffeeY) {
    if (!playerHasPizza() && !playerHasCoffee()) {
      const coffeeRef = firebase.database().ref("gameState/coffee");
      coffeeRef.set(false);
      const playerElement = playerElements[playerId];
      if (playerElement) {
        const coffeeIcon = playerElement.querySelector(
          ".Character_coffee-icon"
        );
        if (coffeeIcon) {
          coffeeIcon.style.display = "inline";
        }
        players[playerId].items = players[playerId].items || {};
        players[playerId].items.coffee = true;
        firebase.database().ref(`players/${playerId}/items/coffee`).set(true);
      }
    } else {
      displayErrorMessage("You can only hold one item at a time!");
    }
  }
}
const coffeeRef = firebase.database().ref("gameState/coffee");
coffeeRef.on("value", (snapshot) => {
  if (!snapshot.val()) {
    removeCoffee();
    setTimeout(() => {
      coffeeRef.set(true);
    }, getRandomDelay(5000, 10000));
  } else {
    placeCoffee();
  }
});

function removeCoffee() {
  const coffeeElement = document.querySelector(".Coffee");
  if (coffeeElement && coffeeElement.parentNode) {
    coffeeElement.parentNode.removeChild(coffeeElement);
  }
}

export function playerHasCoffee() {
  return players[playerId].items && players[playerId].items.coffee;
}
export function playerHasPizza() {
  return players[playerId].items && players[playerId].items.pizza;
}

export function playerLosesCoffee() {
  if (players[playerId].items && players[playerId].items.coffee) {
    players[playerId].items.coffee = false;
    firebase.database().ref(`players/${playerId}/items/coffee`).set(false);

    const playerElement = playerElements[playerId];
    if (playerElement) {
      const coffeeIcon = playerElement.querySelector(".Character_coffee-icon");
      if (coffeeIcon) {
        coffeeIcon.style.display = "none";
      }
    }
  }
}
export function playerLosesPizza() {
  if (players[playerId].items && players[playerId].items.pizza) {
    players[playerId].items.pizza = false;
    firebase.database().ref(`players/${playerId}/items/pizza`).set(false);

    const playerElement = playerElements[playerId];
    if (playerElement) {
      const pizzaIcon = playerElement.querySelector(".Character_pizza-icon");
      if (pizzaIcon) {
        pizzaIcon.style.display = "none";
      }
    }
  }
}

export function playerScoresPoints(points) {
  if (!players[playerId].score) players[playerId].score = 0;
  players[playerId].score += points;
  playerRef.update({ score: players[playerId].score });
}
