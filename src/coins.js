import { getRandomSafeSpot, getKeyString, randomFromArray } from "./misc.js";
import { gameContainer } from "./misc.js";
import { playerId, playerRef, players, checkWinCondition } from "./playerData.js";

export let coins = {};
let coinElements = {};
const allCoinsRef = firebase.database().ref(`coins`);
placeCoin();
export function placeCoin() {
  const { x, y } = getRandomSafeSpot();
  const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
  coinRef.set({
    x,
    y,
  });

  const coinTimeouts = [3000, 4000, 5000, 6000];
  setTimeout(() => {
    placeCoin();
  }, randomFromArray(coinTimeouts));
}
export function attemptGrabCoin(x, y) {
  const key = getKeyString(x, y);
  if (coins[key]) {
    // Remove this key from data, then uptick Player's coin count
    firebase.database().ref(`coins/${key}`).remove();
    playerRef.update({
      coins: players[playerId].coins + 1,
    }).then(() => {
      // After updating coins, check the win condition
      checkWinCondition(playerId);
    });
  }
}
allCoinsRef.on("value", (snapshot) => {
  coins = snapshot.val() || {};
});
allCoinsRef.on("child_added", (snapshot) => {
  const coin = snapshot.val();
  const key = getKeyString(coin.x, coin.y);
  coins[key] = true;

  // Create the DOM Element
  const coinElement = document.createElement("div");
  coinElement.classList.add("Coin", "grid-cell");
  coinElement.innerHTML = `
      <div class="Coin_shadow grid-cell"></div>
      <div class="Coin_sprite grid-cell"></div>
    `;

  // Position the Element
  const left = 16 * coin.x + "px";
  const top = 16 * coin.y - 4 + "px";
  coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  // Keep a reference for removal later and add to DOM
  coinElements[key] = coinElement;
  gameContainer.appendChild(coinElement);
});
allCoinsRef.on("child_removed", (snapshot) => {
  const { x, y } = snapshot.val();
  const keyToRemove = getKeyString(x, y);
  gameContainer.removeChild(coinElements[keyToRemove]);
  delete coinElements[keyToRemove];
});
