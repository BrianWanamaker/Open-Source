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
let lastNpcId = 0;
const chairPositions = [
  { x: 10, y: 6, occupied: false },
  { x: 9, y: 9, occupied: false },
  { x: 4, y: 7, occupied: false },
  { x: 7, y: 9, occupied: false },
];
initializeNPCs();

function getNextNpcId() {
  lastNpcId += 1;
  return `npc${lastNpcId}`;
}
function initializeNPCs() {
  for (let i = 0; i < 4; i++) {
    const id = getNextNpcId();
    npcs[id] = {
      id,
      x: startPosition.x,
      y: startPosition.y,
      direction: "right",
      color: randomFromArray(npcColors),
      targetChair: randomFromArray(chairPositions),
      npcLeaving: false,
    };
    placeNPC(npcs[id]);
  }
}

export function placeNPC(npc) {
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.set(npc);
  makeMove(npc);
}
function makeMove(npc) {
  if (npc.direction === "sitting" || npc.npcLeaving) {
    return;
  }

  if (npc.y === 11 && npc.x < 13) {
    npc.x++;
    npc.direction = "right";

    if (npc.x === npc.targetChair.x) {
      if (npc.targetChair.occupied) {
        npc.y = 11;
        npc.npcLeaving = true;
      } else {
        npc.direction = "up";
      }
    }
  }

  if (npc.x === npc.targetChair.x && !npc.targetChair.occupied) {
    if (npc.y > npc.targetChair.y) {
      npc.y--;
    }
    if (npc.y === npc.targetChair.y) {
      if (npc.targetChair.x === 4 || npc.targetChair.x === 7) {
        npc.facing = "left";
      } else if (npc.targetChair.x === 9 || npc.targetChair.x === 10) {
        npc.facing = "right";
      }
      npc.direction = "sitting";
      npc.targetChair.occupied = true;
      updateNPCPosition(npc);
    }
  }

  updateNPCPosition(npc);

  const moveNPCTimeouts = [1500, 2000];
  setTimeout(() => makeMove(npc), randomFromArray(moveNPCTimeouts));
}

function updateNPCPosition(npc) {
  const npcKey = getKeyString(npc.x, npc.y);
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.update({
    x: npc.x,
    y: npc.y,
    direction: npc.direction,
    color: npc.color,
  });

  const npcElement = npcsElements[npc.id];
  if (npcElement) {
    npcElement.setAttribute("data-direction", npc.direction);
    npcElement.setAttribute("data-color", npc.color);
    if (npc.direction === "sitting") {
      npcElement.setAttribute("data-facing", npc.facing);
      npcElement.classList.remove(
        "walking",
        "idle",
        "right",
        "left",
        "up",
        "down"
      );
      npcElement.classList.add("sitting");
    } else {
      npcElement.classList.remove("sitting");
    }
  }

  let oldX = npc.x;
  let oldY = npc.y;

  switch (npc.direction) {
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
      orderFoodOrDrink(npc);
      return;
  }

  const oldKey = getKeyString(oldX, oldY);
  if (npc.direction !== "sitting" && oldKey !== npcKey) {
    firebase.database().ref(`npcs/${oldKey}`).remove();
  }
  if (npc.direction === "sitting") {
    const facingDirection = npc.facing === "left" ? "left" : "right";
    const sittingClass = `sitting_${npc.color}_${facingDirection}`;
    npcElement.classList.add(sittingClass);
    npcElement.setAttribute("data-facing", npc.facing);
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

function orderFoodOrDrink(npc) {
  const options = ["pizza", "coffee"];
  const order = randomFromArray(options);

  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.update({ order: order });

  const npcElement = npcsElements[getKeyString(npc.x, npc.y)];
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
  npcs[npc.id] = npc;

  const npcElement = document.createElement("div");
  npcElement.classList.add("NPC", "grid-cell");
  npcElement.setAttribute("data-color", npc.color);
  npcElement.setAttribute("data-direction", npc.direction);
  npcElement.innerHTML = `<div class="Npc_sprite grid-cell"></div>`;

  const left = 16 * npc.x + "px";
  const top = 16 * npc.y - 4 + "px";
  npcElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  npcsElements[npc.id] = npcElement;
  gameContainer.appendChild(npcElement);

  if (npc.order) {
    showOrder(npcElement, npc.order);
  }
});

allNPCSRef.on("child_changed", (snapshot) => {
  const npc = snapshot.val();
  const npcKey = getKeyString(npc.x, npc.y);

  npcs[npc.id] = npc;

  const npcElement = npcsElements[npc.id];
  if (npcElement) {
    const left = 16 * npc.x + "px";
    const top = 16 * npc.y - 4 + "px";
    npcElement.style.transform = `translate3d(${left}, ${top}, 0)`;
    npcElement.setAttribute("data-direction", npc.direction);
    npcElement.setAttribute("data-color", npc.color);

    if (npc.order) {
      showOrder(npcElement, npc.order);
    }
  } else {
    console.error("NPC Element not found for ID:", npc.id);
  }
});

allNPCSRef.on("child_removed", (snapshot) => {
  const npcId = snapshot.key;

  const npcElement = npcsElements[npcId];
  if (npcElement && npcElement.parentNode) {
    npcElement.parentNode.removeChild(npcElement);
    delete npcsElements[npcId];
  } else {
    console.error("NPC Element not found or already removed for ID:", npcId);
  }
});
