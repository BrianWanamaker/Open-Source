import { npcColors, randomFromArray, getKeyString } from "./misc.js";
import { gameContainer } from "./misc.js";
import {
  playerHasCoffee,
  playerHasPizza,
  playerLosesPizza,
  playerLosesCoffee,
  playerScoresPoints,
} from "./items.js";

export let npcs = {};
let npcsElements = {};
const allNPCSRef = firebase.database().ref(`npcs`);
let direction = "right";
let startPosition = { x: 2, y: 11 };
let { x, y } = startPosition;
let npcColor = randomFromArray(npcColors);
let npcLeaving = false;

placeNPC();
export function placeNPC() {
  x = startPosition.x;
  y = startPosition.y;
  const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
  npcRef.set({
    x,
    y,
    direction,
    color: npcColor,
  });
  makeMove();
}
function makeMove() {
  const tableX = 7;
  const tableY = 9;
  if (direction === "down") {
    if (y < 11) {
      npcLeaving = true;
      y++;
      updateNPCPosition(x, y, direction, npcColor);
    } else {
      direction = "right";
    }
  }

  if (x === tableX && y === tableY && direction !== "sitting") {
    direction = "sitting";
    updateNPCPosition(x, y, direction, npcColor);
    return;
  }

  if (x === 7 && y > 9 && direction !== "down" && npcLeaving !== true) {
    y--;
    direction = "up";
    updateNPCPosition(x, y, direction, npcColor);
    if (y === 9) {
      direction = "sitting";
      updateNPCPosition(x, y, direction, npcColor);
      return;
    }
  } else if (direction === "right") {
    if (x < 13) {
      x++;
      updateNPCPosition(x, y, direction, npcColor);
    } else {
      firebase.database().ref(`npcs`).remove();
      npcLeaving = false;
      npcColor = randomFromArray(npcColors);
      placeNPC();
      return;
    }
  }
  const moveNPCTimeouts = [1500, 2000];
  setTimeout(makeMove, randomFromArray(moveNPCTimeouts));
}

function updateNPCPosition(x, y, direction, color) {
  const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
  npcRef.set({ x, y, direction, color });
  console.log(direction);

  const npcElement = npcsElements[getKeyString(x, y)];
  if (npcElement) {
    npcElement.setAttribute("data-direction", direction);
    npcElement.setAttribute("data-color", color);
  }
  let oldX = x,
    oldY = y;
  switch (direction) {
    case x === 7 && y === 9 && direction === "up":
      direction == "sitting";
      break;
    case "right":
      oldX -= 1;
      break;
    case "left":
      oldX += 1;
      break;
    case "up":
      oldY += 1;
      break;
    case "down":
      oldY -= 1;
      break;
    case "sitting":
      orderFoodOrDrink(x, y);
      break;
  }

  const oldKey = getKeyString(oldX, oldY);
  if (direction !== "sitting" && oldKey !== getKeyString(x, y)) {
    firebase.database().ref(`npcs/${oldKey}`).remove();
  }
}
export function interactWithNpc(npcKey, npc) {
  console.log(npc.x, npc.y, npc.direction, npc.color);
  if (
    npc.direction === "sitting" &&
    npc.order === "coffee" &&
    playerHasCoffee()
  ) {
    npc.direction = "down";
    direction = "down";
    updateNPCPosition(npc.x, npc.y, npc.direction, npc.color);
    playerLosesCoffee();
    playerScoresPoints(10);
    makeMove();
  } else if (
    npc.direction === "sitting" &&
    npc.order === "pizza" &&
    playerHasPizza()
  ) {
    npc.direction = "down";
    direction = "down";
    updateNPCPosition(npc.x, npc.y, npc.direction, npc.color);
    playerLosesPizza();
    playerScoresPoints(10);
    makeMove();
  }
}

function orderFoodOrDrink(x, y) {
  const options = ["pizza", "coffee"];
  const order = randomFromArray(options);

  const npcKey = getKeyString(x, y);
  const npcRef = firebase.database().ref(`npcs/${npcKey}`);
  npcRef.update({
    order: order,
  });
  const npcElement = npcsElements[npcKey];
  if (npcElement) {
    showOrder(npcElement, order);
  }
}
function showOrder(npcElement, order) {
  let orderBubble = npcElement.querySelector(".order-bubble");
  if (!orderBubble) {
    orderBubble = document.createElement("div");
    orderBubble.classList.add("order-bubble");
    npcElement.appendChild(orderBubble);
  }

  orderBubble.innerText = order === "pizza" ? "🍕" : "☕️";
  orderBubble.style.display = "block";
  orderBubble.style.position = "absolute";
  orderBubble.style.bottom = "24px";
  orderBubble.style.left = "50%";

  orderBubble.classList.add("order-animation");
  // setTimeout(() => {
  //   orderBubble.style.display = "none";
  //   direction = "down";
  //   // makeMove();
  // }, 10000);
}

allNPCSRef.on("value", (snapshot) => {
  npcs = snapshot.val() || {};
});

allNPCSRef.on("value", (snapshot) => {
  npcs = snapshot.val() || {};
});
allNPCSRef.on("child_added", (snapshot) => {
  const npc = snapshot.val();
  const key = getKeyString(npc.x, npc.y);
  npcs[key] = npc; // Store the whole NPC object

  const npcElement = document.createElement("div");
  npcElement.classList.add("NPC", "grid-cell");
  npcElement.setAttribute("data-color", npc.color);
  npcElement.innerHTML = `
      <div class="Npc_sprite grid-cell"></div>
    `;

  const left = 16 * npc.x + "px";
  const top = 16 * npc.y - 4 + "px";
  npcElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  npcsElements[key] = npcElement;
  gameContainer.appendChild(npcElement);

  // Check if this NPC has an order and display it
  if (npc.order) {
    showOrder(npcElement, npc.order);
  }
});

allNPCSRef.on("child_changed", (snapshot) => {
  const npc = snapshot.val();
  const key = getKeyString(npc.x, npc.y);

  npcs[key] = npc;

  if (npc.order) {
    const npcElement = npcsElements[key];
    if (npcElement) {
      showOrder(npcElement, npc.order);
    }
  }
});

allNPCSRef.on("child_removed", (snapshot) => {
  const { x, y } = snapshot.val();
  const keyToRemove = getKeyString(x, y);
  const npcElement = npcsElements[keyToRemove];

  if (npcElement && npcElement.parentNode) {
    npcElement.parentNode.removeChild(npcElement);
    delete npcsElements[keyToRemove];
  } else {
    console.error(
      "NPC Element not found or already removed for key:",
      keyToRemove
    );
  }
});
