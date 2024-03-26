import { attemptGrabPizza, attemptGrabCoffee } from "./items.js";
import { attemptGrabCoin } from "./coins.js";
import { mapData, isSolid } from "./misc.js";
import {
  gameContainer,
  playerNameInput,
  playerColorButton,
  createName,
  getRandomSafeSpot,
  randomFromArray,
  playerColors,
} from "./misc.js";
import { initGame } from "../app.js";

export let allPlayersRef = firebase.database().ref(`players`);
export let playerId;
export let playerRef;
export let players = {};
export let playerElements = {};

new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

export function handleArrowPress(xChange = 0, yChange = 0) {
  const newX = players[playerId].x + xChange;
  const newY = players[playerId].y + yChange;
  if (!isSolid(newX, newY)) {
    //move to the next space
    players[playerId].x = newX;
    players[playerId].y = newY;
    if (xChange === 1) {
      players[playerId].direction = "right";
    }
    if (xChange === -1) {
      players[playerId].direction = "left";
    }
    playerRef.set(players[playerId]);
    attemptGrabCoin(newX, newY);
    attemptGrabPizza(newX, newY);
    attemptGrabCoffee(newX, newY);
  }
}

allPlayersRef.on("value", (snapshot) => {
  //Fires whenever a change occurs
  players = snapshot.val() || {};
  Object.keys(players).forEach((key) => {
    const characterState = players[key];
    let el = playerElements[key];
    // Now update the DOM
    el.querySelector(".Character_name").innerText = characterState.name;
    el.querySelector(".Character_coins").innerText = characterState.coins;
    el.setAttribute("data-color", characterState.color);
    el.setAttribute("data-direction", characterState.direction);
    el.setAttribute("data-animation-state", characterState.animationState);
    const left = 16 * characterState.x + "px";
    const top = 16 * characterState.y - 4 + "px";
    el.style.transform = `translate3d(${left}, ${top}, 0)`;
  });
});

allPlayersRef.on("child_added", (snapshot) => {
  //Fires whenever a new node is added the tree
  const addedPlayer = snapshot.val();
  const characterElement = document.createElement("div");
  characterElement.classList.add("Character", "grid-cell");
  if (addedPlayer.id === playerId) {
    characterElement.classList.add("you");
  }
  characterElement.innerHTML = `
    <div class="Character_shadow grid-cell"></div>
    <div class="Character_sprite grid-cell"></div>
    <div class="Character_name-container">
      <span class="Character_name"></span>
      <span class="Character_coins">0</span>
      <span class="Character_pizza-icon" style="display: none;">🍕</span>
      <span class="Character_coffee-icon" style="display: none;">☕️</span>
    </div>
    <div class="Character_you-arrow"></div>
  `;
  playerElements[addedPlayer.id] = characterElement;

  //Fill in some initial state
  characterElement.querySelector(".Character_name").innerText =
    addedPlayer.name;
  characterElement.querySelector(".Character_coins").innerText =
    addedPlayer.coins;
  characterElement.setAttribute("data-color", addedPlayer.color);
  characterElement.setAttribute("data-direction", addedPlayer.direction);
  characterElement.setAttribute(
    "data-animation-state",
    addedPlayer.animationState
  );
  const left = 16 * addedPlayer.x + "px";
  const top = 16 * addedPlayer.y - 4 + "px";
  characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
  gameContainer.appendChild(characterElement);
});

let movementFlags = {
  up: false,
  down: false,
  left: false,
  right: false,
};

// Function to check if any movement flag is true
function isMoving() {
  return (
    movementFlags.up ||
    movementFlags.down ||
    movementFlags.left ||
    movementFlags.right
  );
}

// Update the animation state based on movement
function updateAnimationState() {
  if (isMoving()) {
    // If any movement flag is true, set the animation state to "walking"
    playerRef.update({
      animationState: "walking",
    });
  } else {
    // If no movement flags are true, set the animation state to "idle"
    playerRef.update({
      animationState: "idle",
    });
  }
}

document.addEventListener("keydown", function (event) {
  let keyHandled = false;
  if (event.key === "ArrowUp") {
    movementFlags.up = true;
    keyHandled = true;
  } else if (event.key === "ArrowDown") {
    movementFlags.down = true;
    keyHandled = true;
  } else if (event.key === "ArrowLeft") {
    movementFlags.left = true;
    keyHandled = true;
  } else if (event.key === "ArrowRight") {
    movementFlags.right = true;
    keyHandled = true;
  } else if (event.key === "k") {
    // Detect space bar
    performKick();
    playerRef.update({
      animationState: "kick", // Update the player's animation state to "kick"
    });

    event.preventDefault(); // Prevent the default space bar action (e.g., page scrolling)
    return; // Skip the movementFlags check and update
  } else if (event.key === "p") {
    attemptToPickUpPlayer();
  } else if (event.key === "t") {
    attemptToThrowPlayer();
  }

  if (keyHandled) {
    event.preventDefault(); // Prevent default action (e.g., scrolling the page)
    updateAnimationState(); // Update the animation state based on the current movement
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowUp") movementFlags.up = false;
  else if (event.key === "ArrowDown") movementFlags.down = false;
  else if (event.key === "ArrowLeft") movementFlags.left = false;
  else if (event.key === "ArrowRight") movementFlags.right = false;

  updateAnimationState(); // Update the animation state when keys are released
});

function performKick() {
  const kickDirection = players[playerId].direction;
  const kickRangeX =
    players[playerId].x +
    (kickDirection === "right" ? 1 : kickDirection === "left" ? -1 : 0);
  const kickRangeY =
    players[playerId].y +
    (kickDirection === "up" ? -1 : kickDirection === "down" ? 1 : 0);

  Object.keys(players).forEach(function (id) {
    if (players[id].x === kickRangeX && players[id].y === kickRangeY) {
      // Attempt to bump the player back by 2 spaces, but check for obstacles
      for (let i = 2; i > 0; i--) {
        const bumpDirectionMultiplier =
          kickDirection === "right" ? i : kickDirection === "left" ? -i : 0;
        const bumpedBackX = players[id].x + bumpDirectionMultiplier;
        const bumpVerticalMultiplier =
          kickDirection === "down" ? i : kickDirection === "up" ? -i : 0;
        const bumpedBackY = players[id].y + bumpVerticalMultiplier;

        // Check if the spot is free or if it's within boundaries
        if (
          !isSolid(bumpedBackX, bumpedBackY) &&
          withinBoundaries(bumpedBackX, bumpedBackY)
        ) {
          // Move the player as far as possible before hitting the obstacle
          // Update the bumped player's position and animation state to "hit" in Firebase
          firebase.database().ref(`players/${id}`).update({
            x: bumpedBackX,
            y: bumpedBackY,
            animationState: "hit", // Set the animation state to "hit"
          });
          console.log(
            `Player ${id} was kicked and moved to (${bumpedBackX}, ${bumpedBackY}).`
          );

          // Set a timeout to revert the animation state after 1 second
          setTimeout(() => {
            firebase.database().ref(`players/${id}`).update({
              animationState: "idle", // Revert to idle or another appropriate state
            });
          }, 500); // 1000 milliseconds = 1 second

          break; // Exit the loop after moving the player
        }
      }
    }
  });
}

function attemptToPickUpPlayer() {
  Object.keys(players).forEach(function (id) {
    if (id !== playerId) {
      // Make sure the player is not trying to pick up themselves
      const otherPlayer = players[id];
      const distanceX = Math.abs(players[playerId].x - otherPlayer.x);
      const distanceY = Math.abs(players[playerId].y - otherPlayer.y);

      // Check if the other player is adjacent (one tile away in any direction)
      if (
        (distanceX === 1 && distanceY === 0) ||
        (distanceX === 0 && distanceY === 1)
      ) {
        carryingPlayerId = id; // Set the carrying state

        firebase.database().ref(`players/${playerId}`).update({ carrying: id });
        firebase.database().ref(`players/${id}`).update({ isCarried: true });

        console.log(`Player ${playerId} is now carrying player ${id}.`);
      }
    }
  });
}

const throwDistance = 2; // Tiles the player can be thrown

function attemptToThrowPlayer() {
  if (carryingPlayerId) {
    const direction = players[playerId].direction; // The carrying player's facing direction
    let newX = players[playerId].x; // Start from the carrying player's position
    let newY = players[playerId].y;

    // Adjust the thrown player's new position based on the direction
    switch (direction) {
      case "up":
        newY -= throwDistance; // Move up relative to the carrying player
        break;
      case "down":
        newY += throwDistance; // Move down
        break;
      case "left":
        newX -= throwDistance; // Move left
        break;
      case "right":
        newX += throwDistance; // Move right
        break;
      default:
        console.log("Unknown direction");
        return; // Exit if direction is not recognized
    }

    // Validate the new position
    if (!isSolid(newX, newY) && withinBoundaries(newX, newY)) {
      // Update the thrown player's position
      players[carryingPlayerId].x = newX;
      players[carryingPlayerId].y = newY;

      // Update Firebase with the new position of the thrown player
      firebase.database().ref(`players/${carryingPlayerId}`).update({
        x: newX,
        y: newY,
        isCarried: false, // Reset the carried status
      });

      // Reset the carrying player's state
      firebase.database().ref(`players/${playerId}`).update({ carrying: null });
      carryingPlayerId = null; // No longer carrying
    } else {
      console.log("Invalid throw destination.");
    }
  }
}

function withinBoundaries(x, y) {
  return (
    x >= mapData.minX &&
    x <= mapData.maxX &&
    y >= mapData.minY &&
    y <= mapData.maxY
  );
}
//Remove character DOM element after they leave
allPlayersRef.on("child_removed", (snapshot) => {
  const removedKey = snapshot.val().id;
  gameContainer.removeChild(playerElements[removedKey]);
  delete playerElements[removedKey];
});

//Updates player name with text input
playerNameInput.addEventListener("change", (e) => {
  const newName = e.target.value || createName();
  playerNameInput.value = newName;
  playerRef.update({
    name: newName,
  });
});

//Update player color on button click
playerColorButton.addEventListener("click", () => {
  const mySkinIndex = playerColors.indexOf(players[playerId].color);
  const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
  playerRef.update({
    color: nextColor,
  });
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    //You're logged in!
    playerId = user.uid;
    playerRef = firebase.database().ref(`players/${playerId}`);

    const name = createName();
    playerNameInput.value = name;

    const { x, y } = getRandomSafeSpot();

    playerRef.set({
      id: playerId,
      name,
      direction: "right",
      animationState: "idle",
      color: randomFromArray(playerColors),
      x,
      y,
      coins: 0,
    });

    //Remove me from Firebase when I diconnect
    playerRef.onDisconnect().remove();

    //Begin the game now that we are signed in
    initGame();
  } else {
    //You're logged out.
  }
});

firebase
  .auth()
  .signInAnonymously()
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
