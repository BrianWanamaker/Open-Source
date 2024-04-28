import { attemptGrabPizza, attemptGrabCoffee } from "./items.js";
import { attemptGrabCoin } from "./coins.js";
import { mapData, isSolid } from "./misc.js";
import { npcs, interactWithNpc, initializeNPCs } from "./npc.js";
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
export let carryingPlayerId = null;
let escapeKeyPressCount = 0;
const ESCAPE_KEY_PRESS_LIMIT = 10;

const WIN_COIN_COUNT = 75;

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
  checkForNpcInteraction(newX, newY);
}

function checkForNpcInteraction(playerX, playerY) {
  Object.keys(npcs).forEach((npcKey) => {
    const npc = npcs[npcKey];
    if (npc.x === playerX && npc.y === playerY) {
      interactWithNpc(npcKey, npc);
    }
  });
}

let countdownInterval = null;

function showWinPopup(winningPlayerId, countdownSeconds = 10) {
  // Clear any existing popup and intervals
  const existingPopup = document.querySelector(".win-popup");
  if (existingPopup) {
    gameContainer.removeChild(existingPopup);
  }
  clearExistingInterval();

  // Define player and game status
  const isLocalPlayerWinner = playerId === winningPlayerId;
  const winningPlayerName = players[winningPlayerId].name;
  const localPlayerName = players[playerId].name;
  const displayedName = isLocalPlayerWinner
    ? winningPlayerName
    : localPlayerName;
  const statusMessage = isLocalPlayerWinner
    ? "🏆 Winner! 🏆"
    : "Better luck next time";
  const titleText = isLocalPlayerWinner ? "Congratulations!" : "Game Over!";

  // Construct the leaderboard HTML
  const sortedPlayers = Object.values(players).sort(
    (a, b) => b.coins - a.coins
  );
  let leaderboardHTML = '<ol class="leaderboard">';
  sortedPlayers.forEach((player, index) => {
    const itemClass = player.id === winningPlayerId ? "winner" : "loser";
    leaderboardHTML += `<li class="${itemClass}">${index + 1}. ${
      player.name
    } - ${player.coins} ${player.readyToPlayAgain ? "✅" : ""}</li>`;
  });
  leaderboardHTML += "</ol>";

  // Create the win popup with dynamic countdown message
  const winPopup = document.createElement("div");
  winPopup.className = "win-popup";
  winPopup.innerHTML = `
    <h2 class="win-title">${titleText}</h2>
    <p class="status-message ${
      isLocalPlayerWinner ? "winner" : "loser"
    }">${statusMessage} ${displayedName}</p>
    <h3>Leaderboard</h3>
    ${leaderboardHTML}
    <p id="countdown" style="font-size: 20px; font-weight: bold; margin-top: 20px;">Restarting in ${countdownSeconds} seconds...</p>
  `;
  gameContainer.appendChild(winPopup);

  // Start dynamic countdown
  let counter = countdownSeconds;
  const countdownElement = winPopup.querySelector("#countdown");
  countdownInterval = setInterval(() => {
    counter--;
    if (countdownElement) {
      countdownElement.textContent = `Restarting in ${counter} seconds...`;
    }

    if (counter <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null; // Clear the interval variable after clearing it
      resetGame();
    }
  }, 1000);
}

function clearExistingInterval() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function resetGame() {
  // reset the game
  console.log("Resetting the game...");
  clearExistingInterval();
  // rest player score
  playerRef.update({
    coins: 0,
  });
  // Reset all players' coins
  allPlayersRef.once("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      firebase.database().ref(`players/${childKey}`).update({
        coins: 0,
        readyToPlayAgain: false,
      });
    });
  });
  //reset player location
  const { x, y } = getRandomSafeSpot();
  playerRef.update({
    x,
    y,
    readyToPlayAgain: true,
  });

  // Remove the win popup
  const winPopup = document.querySelector(".win-popup");
  if (winPopup) {
    gameContainer.removeChild(winPopup);
  }
  // Start the game again
  initGame();
}

export function checkWinCondition(playerId) {
  const player = players[playerId];
  if (player.coins >= WIN_COIN_COUNT) {
    // The player has won
    console.log(`Player ${playerId} wins with ${player.coins} coins.`);
    firebase.database().ref("gameState").set({
      gameEnded: true,
      winnerId: playerId,
    });
  }
}

allPlayersRef.on("value", (snapshot) => {
  players = snapshot.val() || {};
  Object.keys(players).forEach((key) => {
    const characterState = players[key];
    let el = playerElements[key];
    if (!el) {
      console.error("No element found for player:", key);
      return; // Skip this iteration if the element doesn't exist
    }
    // Update visibility based on the new `isVisible` property
    if (characterState.isVisible === false) {
      el.style.display = "none";
    } else {
      el.style.display = ""; // Or whatever display was initially ('block', 'flex', etc.)
    }
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
  const addedPlayer = snapshot.val();
  // Verify addedPlayer and its ID are valid
  if (!addedPlayer || !addedPlayer.id) {
    console.error("Invalid player data or missing ID:", addedPlayer);
    return;
  }
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

// Update the animation state based on movement and carrying status
function updateAnimationState() {
  if (carryingPlayerId && players[playerId].isCarrying) {
    // Ensure that we only set "pickedUp" if the player is still carrying another player
    playerRef.update({
      animationState: "pickedUp",
    });
  } else if (isMoving()) {
    playerRef.update({
      animationState: "walking",
    });
  } else {
    playerRef.update({
      animationState: "idle",
    });
  }
}

document.addEventListener("keydown", function (event) {
  console.log("Key pressed:", event.key);
  const activeElement = document.activeElement;
  const chatInput = document.querySelector("#chat-input");
  const playerNameInput = document.querySelector("#player-name");

  if (
    (activeElement === chatInput || activeElement === playerNameInput) &&
    ["k", "p", "t"].includes(event.key)
  ) {
    return;
  }

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
    performKick();
    playerRef.update({ animationState: "kick" });
  } else if (event.key === "p") {
    if (!carryingPlayerId) {
      attemptToPickUpPlayer();
    }
    keyHandled = true;
  } else if (event.key === "t") {
    attemptToThrowPlayer();
    keyHandled = true;
  } else if (event.key === "e" && players[playerId].isCarried) {
    console.log("Escape attempt detected");
    escapeKeyPressCount++;
    console.log("Escape key press count:", escapeKeyPressCount);
    if (escapeKeyPressCount >= ESCAPE_KEY_PRESS_LIMIT) {
      console.log("Attempting to escape");
      escapePlayer();
      keyHandled = true;
    }
  }

  if (keyHandled) {
    event.preventDefault(); // To ensure it captures 'e' properly
    updateAnimationState();
  }
});

firebase
  .database()
  .ref("gameState")
  .on("value", (snapshot) => {
    const state = snapshot.val();
    console.log("Current game state:", state); // Log the current game state to debug
    if (state && state.gameEnded) {
      console.log("Game has ended, showing win popup.");
      showWinPopup(state.winnerId);
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
          firebase
            .database()
            .ref(`players/${id}`)
            .update({
              x: bumpedBackX,
              y: bumpedBackY,
              animationState: "hit", // Set the animation state to "hit"
              coins: Math.max(players[id].coins - 1, 0),
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
    if (id !== playerId && !carryingPlayerId && !players[id].isCarried) {
      const otherPlayer = players[id];
      const distanceX = Math.abs(players[playerId].x - otherPlayer.x);
      const distanceY = Math.abs(players[playerId].y - otherPlayer.y);

      console.log(`Trying to pick up: Checking conditions for ${id}`);

      if (
        (distanceX === 1 && distanceY === 0) ||
        (distanceX === 0 && distanceY === 1)
      ) {
        carryingPlayerId = id; // Mark the carrying player ID
        players[playerId].isCarrying = true;
        players[id].isCarried = true;
        players[id].carriedBy = playerId; // This is the reciprocal link

        firebase.database().ref(`players/${playerId}`).update({
          isCarrying: true,
          carryingPlayerId: id,
        });

        firebase.database().ref(`players/${id}`).update({
          isCarried: true,
          carriedBy: playerId,
          isVisible: false,
        });

        console.log(`Player ${playerId} is now carrying player ${id}.`);
      }
    }
  });
}

function escapePlayer() {
  if (players[playerId].isCarried && players[playerId].carriedBy) {
    let carrierId = players[playerId].carriedBy;

    console.log(
      `Escape initiated by ${playerId} who is carried by ${carrierId}`
    );

    // Reset escape key press count
    escapeKeyPressCount = 0;

    // Clear carried status on both the carried and the carrier
    firebase.database().ref(`players/${playerId}`).update({
      isCarried: false,
      isVisible: true,
      animationState: "idle",
      carriedBy: null,
    });

    firebase.database().ref(`players/${carrierId}`).update({
      isCarrying: false,
      carryingPlayerId: null,
      animationState: "idle",
    });

    carryingPlayerId = null; // Also reset the local state

    // Optionally move the player to a nearby spot if needed
    let nearbyX = players[playerId].x + 1;
    let nearbyY = players[playerId].y;
    if (!isSolid(nearbyX, nearbyY) && withinBoundaries(nearbyX, nearbyY)) {
      players[playerId].x = nearbyX;
      players[playerId].y = nearbyY;
      playerRef.set(players[playerId]);
    }

    console.log(
      `Player ${playerId} has successfully escaped from being carried.`
    );
  }
}

const throwDistance = 2; // Tiles the player can be thrown

function attemptToThrowPlayer() {
  if (carryingPlayerId) {
    const direction = players[playerId].direction;
    let newX = players[playerId].x;
    let newY = players[playerId].y;
    escapeKeyPressCount = 0;

    // Adjust newX and newY based on the direction
    switch (direction) {
      case "up":
        newY -= throwDistance;
        break;
      case "down":
        newY += throwDistance;
        break;
      case "left":
        newX -= throwDistance;
        break;
      case "right":
        newX += throwDistance;
        break;
    }

    if (!isSolid(newX, newY) && withinBoundaries(newX, newY)) {
      const updates = {
        x: newX,
        y: newY,
        isVisible: true,
        animationState: "idle",
        isCarried: false,
      };

      // Update Firebase with the new position
      firebase.database().ref(`players/${carryingPlayerId}`).update(updates);

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
  const removedPlayerId = snapshot.key; // Use .key to get the ID
  if (playerElements[removedPlayerId]) {
    gameContainer.removeChild(playerElements[removedPlayerId]);
    delete playerElements[removedPlayerId];
  }
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
    // You're logged in!
    playerId = user.uid;
    playerRef = firebase.database().ref(`players/${playerId}`);

    allPlayersRef.once("value", (snapshot) => {
      if (
        !snapshot.exists() ||
        snapshot.numChildren() === 1 ||
        snapshot.numChildren() === 0
      ) {
        console.log("Setting to null");
        const updates = {
          "/npcs": null,
          "/lastNpcId": null,
          "/npcInitStatus": null,
          "/chairs": null,
          "/coins": null,
        };
        firebase.database().ref().update(updates);
        initializeNPCs();
      }
    });

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
      items: { coffee: false, pizza: false },
    });

    playerRef.onDisconnect().remove();

    initGame();
  } else {
    // You're logged out.
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
function updateLiveScoreboard() {
  const scoreboardElement = document.getElementById("live-scoreboard");
  scoreboardElement.innerHTML = "";
  const sortedPlayers = Object.values(players).sort(
    (a, b) => b.coins - a.coins
  );

  sortedPlayers.forEach((player) => {
    const playerItem = document.createElement("li");
    playerItem.textContent = `${player.name}: ${player.coins} coins`;
    scoreboardElement.appendChild(playerItem);
  });
}

allPlayersRef.on("value", (snapshot) => {
  players = snapshot.val() || {};
  updateLiveScoreboard();
});
