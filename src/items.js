import { gameContainer } from "./misc.js";
import { playerId, playerElements } from "./playerData.js";

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
  if (!document.querySelector(".Pizza")) {
    pizzaX = 11;
    pizzaY = 4;

    const pizzaElement = document.createElement("div");
    pizzaElement.classList.add("Pizza", "grid-cell");
    pizzaElement.innerHTML = `<div class="Pizza_sprite grid-cell"></div>`;

    const left = 16 * pizzaX + "px";
    const top = 16 * pizzaY + "px";
    pizzaElement.style.transform = `translate3d(${left}, ${top}, 0)`;

    gameContainer.appendChild(pizzaElement);
  }
}

export function attemptGrabPizza(x, y) {
  if (x === pizzaX && y === pizzaY) {
    const pizzaRef = firebase.database().ref("gameState/pizza");
    pizzaRef.set({ pickedUp: true, by: playerId });

    const playerElement = playerElements[playerId];
    if (playerElement) {
      const pizzaIcon = playerElement.querySelector(".Character_pizza-icon");
      if (pizzaIcon) {
        pizzaIcon.style.display = "inline";
      }
    }
  }
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const pizzaRef = firebase.database().ref("gameState/pizza");
pizzaRef.on("value", (snapshot) => {
  const pizzaState = snapshot.val();
  if (pizzaState && pizzaState.pickedUp) {
    removePizza();
    setTimeout(placePizza, getRandomDelay(5000, 10000));
  }
});

function removePizza() {
  console.log("pizza removed");
  const pizzaElement = document.querySelector(".Pizza");
  if (pizzaElement) {
    gameContainer.removeChild(pizzaElement);
  }
}
function placeCoffee() {
  if (!document.querySelector(".Coffee")) {
    coffeeX = 3;
    coffeeY = 4;

    const coffeeElement = document.createElement("div");
    coffeeElement.classList.add("Coffee", "grid-cell");
    coffeeElement.innerHTML = `<div class="Coffee_sprite grid-cell"></div>`;

    const left = 16 * coffeeX + "px";
    const top = 16 * coffeeY + "px";
    coffeeElement.style.transform = `translate3d(${left}, ${top}, 0)`;

    gameContainer.appendChild(coffeeElement);
  }
}

export function attemptGrabCoffee(x, y) {
  if (x === coffeeX && y === coffeeY) {
    const coffeeRef = firebase.database().ref("gameState/coffee");
    coffeeRef.set({ pickedUp: true, by: playerId });

    const playerElement = playerElements[playerId];
    if (playerElement) {
      const coffeeIcon = playerElement.querySelector(".Character_coffee-icon");
      if (coffeeIcon) {
        coffeeIcon.style.display = "inline";
      }
    }
  }
}

const coffeeRef = firebase.database().ref("gameState/coffee");
coffeeRef.on("value", (snapshot) => {
  const coffeeState = snapshot.val();
  if (coffeeState && coffeeState.pickedUp) {
    removeCoffee();
    setTimeout(placeCoffee, getRandomDelay(5000, 10000));
  }
});

function removeCoffee() {
  const coffeeElement = document.querySelector(".Coffee");
  console.log("remove coffee");
  if (coffeeElement) {
    gameContainer.removeChild(coffeeElement);
  }
}
