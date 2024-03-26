import { npcColors, randomFromArray, getKeyString } from "./misc.js";
import { gameContainer } from "./misc.js";

let npcs = {};
let npcsElements = {};
const allNPCSRef = firebase.database().ref(`npcs`);
// place the npcs
placeAndMoveNPC();
export function placeAndMoveNPC() {
  let npcColor = randomFromArray(npcColors);
  // bottom left (2,11) or bottom right (12,11)
  let startPosition = { x: 2, y: 11 };
  let { x, y } = startPosition;

  let direction = "right";
  const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
  npcRef.set({
    x,
    y,
    direction,
    color: npcColor,
  });

  function makeMove() {
    let direction = "right";

    const tableX = 7;
    const tableY = 9;
    if (x === tableX && y === tableY) {
      direction = "sitting";
      console.log("TRUE");
      updateNPCPosition(x, y, direction, npcColor);
      return;
    }
    console.log(x + " " + y);

    if (x === 7 && y > 9) {
      y--;
      direction = "up";
      updateNPCPosition(x, y, direction, npcColor);
      if (y === 9) {
        direction = "sitting";
        updateNPCPosition(x, y, direction, npcColor);
        return;
      }
    } else if (direction === "right" && x < 7) {
      x++;
      updateNPCPosition(x, y, direction, npcColor);
    } else if (direction === "left" && x > 7) {
      x--;
      updateNPCPosition(x, y, direction, npcColor);
    }
    const moveNPCTimeouts = [1000, 1500];
    setTimeout(makeMove, randomFromArray(moveNPCTimeouts));
  }
  makeMove();
}

function updateNPCPosition(x, y, direction, color) {
  const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
  npcRef.set({ x, y, direction, color });

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
      break;
  }

  const oldKey = getKeyString(oldX, oldY);
  if (direction !== "sitting" && oldKey !== getKeyString(x, y)) {
    firebase.database().ref(`npcs/${oldKey}`).remove();
  }
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
  npcs[key] = true;

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
