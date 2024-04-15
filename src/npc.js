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
function initializeNPCs() {
  const npcInitRef = firebase.database().ref("npcInitStatus");
  npcInitRef.transaction(
    (current) => {
      if (current === null) {
        return "initializing";
      } else {
        return;
      }
    },
    (error, committed, snapshot) => {
      if (error) {
        console.log(error);
      } else if (committed) {
        createNpcWithDelay(0);
        npcInitRef.set("completed");
      } else {
        allNPCSRef.once("value", (snapshot) => {
          if (snapshot.exists()) {
            npcs = snapshot.val();
            Object.values(npcs).forEach((npc) => {
              if (!npcsElements[npc.id]) {
                createNpcElement(npc);
              }
            });
          }
        });
      }
    }
  );
}

function createNpcWithDelay(index) {
  if (index < 4) {
    getNextNpcId((id) => {
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
      setTimeout(
        () => createNpcWithDelay(index + 1),
        randomFromArray([7000, 8000, 9000, 10000, 11000])
      );
    });
  }
}
function updateNpcElement(npc) {
  let npcElement = npcsElements[npc.id];
  if (!npcElement) {
    createNpcElement(npc);
    npcElement = npcsElements[npc.id];
  }

  const left = 16 * npc.x + "px";
  const top = 16 * npc.y - 4 + "px";
  npcElement.style.transform = `translate3d(${left}, ${top}, 0)`;
  npcElement.setAttribute("data-direction", npc.direction);
  npcElement.setAttribute("data-color", npc.color);

  npcElement.className = "NPC grid-cell";
  npcElement.classList.add(npc.direction);
  npcElement.classList.add(npc.color);

  if (npc.order) {
    showOrder(npcElement, npc.order);
  }
}

function getNextNpcId(callback) {
  const idRef = firebase.database().ref("lastNpcId");
  idRef.transaction(
    (current) => {
      return (current || 0) + 1;
    },
    (error, committed, snapshot) => {
      if (committed) {
        callback(`npc${snapshot.val()}`);
      }
    }
  );
}
function createNpcElement(npc) {
  const npcElement = document.createElement("div");
  npcElement.classList.add("NPC", "grid-cell");
  npcElement.setAttribute("data-color", npc.color);
  npcElement.setAttribute("data-direction", npc.direction);
  npcElement.innerHTML = `<div class="Npc_sprite grid-cell"></div>`;

  const left = 16 * npc.x + "px";
  const top = 16 * npc.y - 4 + "px";
  npcElement.style.transform = `translate3d(${left}, ${top}, 0)`;

  gameContainer.appendChild(npcElement);
  npcsElements[npc.id] = npcElement;

  if (npc.order) {
    showOrder(npcElement, npc.order);
  }
}

export function placeNPC(npc) {
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.set(npc);
  makeMove(npc);
}
function makeMove(npc) {
  if (npc.direction === "sitting" && !npc.npcLeaving) {
    return;
  }

  if (npc.npcLeaving) {
    if (npc.y < 11) {
      npc.y++;
      npc.direction = "down";
    } else if (npc.x < 13) {
      npc.x++;
      npc.direction = "right";
    } else {
      removeNPC(npc);
      return;
    }
    updateNPCPosition(npc);
    setTimeout(() => makeMove(npc), randomFromArray([1500, 2000]));
    return;
  }

  if (npc.y === 11 && npc.x < 13) {
    npc.x++;
    npc.direction = "right";

    if (npc.x === npc.targetChair.x) {
      if (npc.targetChair.occupied) {
        npc.npcLeaving = true;
        npc.direction = "down";
        updateNPCPosition(npc);
        makeMove(npc);
        return;
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

      const chairIndex = chairPositions.findIndex((chair) => {
        return chair.x === npc.targetChair.x && chair.y === npc.targetChair.y;
      });

      if (chairIndex !== -1) {
        const chairsRef = firebase.database().ref(`chairs/${chairIndex}`);
        chairsRef.update({ occupied: true });
      }
      orderFoodOrDrink(npc);
    }
  }

  updateNPCPosition(npc);
  const moveNPCTimeouts = [1500, 2000];
  setTimeout(() => makeMove(npc), randomFromArray(moveNPCTimeouts));
}

function updateNPCPosition(npc) {
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.update({
    x: npc.x,
    y: npc.y,
    direction: npc.direction,
    color: npc.color,
  });
  updateNpcElement(npc);

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
}

export function interactWithNpc(npcKey, npc) {
  if (npc.direction === "sitting" && npc.order) {
    if (
      (npc.order === "coffee" && playerHasCoffee()) ||
      (npc.order === "pizza" && playerHasPizza())
    ) {
      if (npc.order === "coffee") {
        playerLosesCoffee();
      } else if (npc.order === "pizza") {
        playerLosesPizza();
      }
      playerScoresPoints(10);


      npc.order = null;
      clearOrder(npc);
      npc.npcLeaving = true;
      npc.direction = "down";
      updateNPCPosition(npc);
      makeMove(npc);
    }
  }
}
function clearOrder(npc) {
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef
    .update({
      order: null,
      npcLeaving: true,
    })
    .then(() => {
      const npcElement = npcsElements[npc.id];
      if (npcElement) {
        let orderBubble = npcElement.querySelector(".order-bubble");
        if (orderBubble) {
          orderBubble.style.display = "none";
        }
      }
      console.log(`Order cleared and NPC marked as leaving for ID: ${npc.id}`);
    });
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
  if (!npcs[npc.id]) {
    npcs[npc.id] = npc;
    createNpcElement(npc);
  }
});

allNPCSRef.on("child_changed", (snapshot) => {
  const npc = snapshot.val();
  if (npcs[npc.id]) {
    npcs[npc.id] = npc;
    updateNpcElement(npc);
  }
});

allNPCSRef.on("child_removed", (snapshot) => {
  const npcId = snapshot.key;
  const npcElement = npcsElements[npcId];
  if (npcElement && npcElement.parentNode) {
    npcElement.parentNode.removeChild(npcElement);
    delete npcsElements[npcId];
    delete npcs[npcId];
  } else {
    console.error("NPC Element not found or already removed for ID:", npcId);
  }
});
function removeNPC(npc) {
  const npcRef = firebase.database().ref(`npcs/${npc.id}`);
  npcRef.remove();
  const npcElement = npcsElements[npc.id];
  if (npcElement) {
    gameContainer.removeChild(npcElement);
    delete npcsElements[npc.id];
  }
  checkForRemainingNPCs();
}
function checkForRemainingNPCs() {
  allNPCSRef.once("value", (snapshot) => {
    const npcsData = snapshot.val();

    if (npcsData && Object.keys(npcsData).length <= 1) {
      chairPositions.forEach((chair, index) => {
        chairPositions[index].occupied = false;
      });

      const chairsRef = firebase.database().ref("chairs");
      chairPositions.forEach((chair, index) => {
        chairsRef.child(index).update({ occupied: false });
      });

      console.log("All chair positions have been reset to unoccupied:");
      chairPositions.forEach((chair, index) => {
        console.log(
          `Chair ${index}: x=${chair.x}, y=${chair.y}, occupied=${chair.occupied}`
        );
      });

      setTimeout(
        () => createNpcWithDelay(1),
        randomFromArray([7000, 8000, 9000, 10000, 11000])
      );
    }
  });
}
