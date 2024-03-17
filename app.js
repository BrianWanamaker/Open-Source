const mapData = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "4x7": true,
    "5x7": true,
    "6x7": true,
    "8x6": true,
    "9x6": true,
    "10x6": true,
    "7x9": true,
    "8x9": true,
    "9x9": true,
  },
};

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange"];

//Misc Helpers
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}

function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
  ]);
  return `${prefix} ${animal}`;
}

function isSolid(x, y) {
  const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
  return (
    blockedNextSpace ||
    x >= mapData.maxX ||
    x < mapData.minX ||
    y >= mapData.maxY ||
    y < mapData.minY
  );
}

function getRandomSafeSpot() {
  //We don't look things up by key here, so just return an x/y
  return randomFromArray([
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 2, y: 9 },
    { x: 4, y: 8 },
    { x: 5, y: 5 },
    { x: 5, y: 8 },
    { x: 5, y: 10 },
    { x: 5, y: 11 },
    { x: 11, y: 7 },
    { x: 12, y: 7 },
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 13, y: 8 },
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 10, y: 8 },
    { x: 8, y: 8 },
    { x: 11, y: 4 },
  ]);
}

(function () {
  let playerId;
  let playerRef;
  let players = {};
  let playerElements = {};
  let coins = {};
  let coinElements = {};
  let npcs = {};
  let npcsElements = {};
  // Global variables for pizza position
  let pizzaX = 7; // Initial x position
  let pizzaY = 7; // Initial y position

  // Global variables for cofee position
  let coffeeX = 7; // Initial x position
  let coffeeY = 7; // Initial y position

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  const playerColorButton = document.querySelector("#player-color");

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

  function attemptGrabPizza(x, y) {
    console.log(
      `Player position: (${x},${y}), Pizza position: (${pizzaX},${pizzaY})`
    );

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
      console.log(`Pizza picked up by ${pizzaState.by}`);
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

  function attemptGrabCoffee(x, y) {
    if (x === coffeeX && y === coffeeY) {
      // Update Firebase to indicate coffee has been picked up
      const coffeeRef = firebase.database().ref("gameState/coffee");
      coffeeRef.set({ pickedUp: true, by: playerId });

      // Show the coffee icon next to the player's name
      const playerElement = playerElements[playerId];
      if (playerElement) {
        const coffeeIcon = playerElement.querySelector(
          ".Character_coffee-icon"
        );
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
      console.log(`Coffee picked up by ${coffeeState.by}`);
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

  // placeCoffee();
  // placePizza();

  function placeCoin() {
    const { x, y } = getRandomSafeSpot();
    const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
    coinRef.set({
      x,
      y,
    });

    const coinTimeouts = [2000, 3000, 4000, 5000];
    setTimeout(() => {
      placeCoin();
    }, randomFromArray(coinTimeouts));
  }
  // place the npcs
  function placeAndMoveNPC() {
    // Decide starting position: bottom left (2,11) or bottom right (12,11)
    let startPosition =
      Math.random() < 0.5 ? { x: 2, y: 11 } : { x: 12, y: 11 };
    let { x, y } = startPosition;

    let direction = x === 2 ? "right" : "left"; // Move right if starting from the left, left if from the right

    // Initial NPC Reference in Firebase
    const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
    npcRef.set({
      x,
      y,
      direction,
    });

    function makeMove() {
      // Check if NPC is directly beneath the table and if it should move towards it
      if (x === 7 && y > 9) {
        if (Math.random() < 0.2) {
          // 1 in 5 chance to move up
          y--; // Move one step up
          direction = "up";
          updateNPCPosition(x, y, direction);
          if (y === 9) {
            // NPC is now sitting at the table, so it won't move further
            return;
          }
        }
      } else if (direction === "right" && x < 7) {
        x++;
        updateNPCPosition(x, y, direction);
      } else if (direction === "left" && x > 7) {
        x--;
        updateNPCPosition(x, y, direction);
      }

      // Schedule the next move
      const moveNPCTimeouts = [1000, 1500];
      setTimeout(makeMove, randomFromArray(moveNPCTimeouts));
    }

    // Start the NPC movement
    makeMove();
  }

  function updateNPCPosition(x, y, direction, sitting = false) {
    const npcRef = firebase.database().ref(`npcs/${getKeyString(x, y)}`);
    npcRef.set({ x, y, direction }); // Update NPC position in Firebase

    // Determine the old key for the position from which the NPC is moving
    let oldX = x;
    let oldY = y;
    switch (direction) {
      case "right":
        oldX = x - 1;
        break;
      case "left":
        oldX = x + 1;
        break;
      case "up":
        oldY = y + 1;
        break;
      case "down":
        oldY = y - 1;
        break;
    }

    const oldKey = getKeyString(oldX, oldY);
    if (!sitting && oldKey !== getKeyString(x, y)) {
      // Remove old NPC position from Firebase, only if not sitting
      firebase.database().ref(`npcs/${oldKey}`).remove();
    }
  }

  function attemptGrabCoin(x, y) {
    console.log(` x=${players[playerId].x}, y=${players[playerId].y}`);
    const key = getKeyString(x, y);
    if (coins[key]) {
      // Remove this key from data, then uptick Player's coin count
      firebase.database().ref(`coins/${key}`).remove();
      playerRef.update({
        coins: players[playerId].coins + 1,
      });
    }
  }

  function handleArrowPress(xChange = 0, yChange = 0) {
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

  function initGame() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    const allPlayersRef = firebase.database().ref(`players`);
    const allNPCSRef = firebase.database().ref(`npcs`);
    const allCoinsRef = firebase.database().ref(`coins`);

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
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      gameContainer.appendChild(characterElement);
    });

    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    });

    //New - not in the video!
    //This block will remove coins from local state when Firebase `coins` value updates
    allCoinsRef.on("value", (snapshot) => {
      coins = snapshot.val() || {};
    });
    //
    allNPCSRef.on("value", (snapshot) => {
      npcs = snapshot.val() || {};
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

    allNPCSRef.on("value", (snapshot) => {
      npcs = snapshot.val() || {};
    });
    allNPCSRef.on("child_added", (snapshot) => {
      const npc = snapshot.val();
      const key = getKeyString(npc.x, npc.y);
      npcs[key] = true;

      const npcElement = document.createElement("div");
      npcElement.classList.add("NPC", "grid-cell");
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

    allCoinsRef.on("child_removed", (snapshot) => {
      const { x, y } = snapshot.val();
      const keyToRemove = getKeyString(x, y);
      gameContainer.removeChild(coinElements[keyToRemove]);
      delete coinElements[keyToRemove];
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

    //Place my first coin
    placeCoin();
    //Place NPC
    placeAndMoveNPC();
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log(user);
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

  // chat features
  function sendMessage(message, playerId) {
    const messageRef = firebase
      .database()
      .ref(`players/${playerId}/messages`)
      .push();
    messageRef.set({
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }
  //save chat messages to firebase
  document.addEventListener("DOMContentLoaded", (event) => {
    document.querySelector("#send-message").addEventListener("click", () => {
      const messageInput = document.querySelector("#chat-input");
      const message = messageInput.value.trim();
      const MAX_LENGTH = 25;

      if (message.length > MAX_LENGTH) {
        alert(`Messages cannot be longer than ${MAX_LENGTH} characters.`);
        return;
      }

      if (message) {
        sendMessage(message, playerId);
        messageInput.value = "";
      }
    });
    //displays old messages first
    firebase
      .database()
      .ref("players")
      .on("value", (snapshot) => {
        const players = snapshot.val();
        const allMessages = [];
        Object.keys(players).forEach((playerId) => {
          const player = players[playerId];
          const messages = player.messages || {};

          Object.keys(messages).forEach((messageId) => {
            const message = messages[messageId];
            allMessages.push({
              text: message.text,
              timestamp: message.timestamp,
              playerName: player.name,
            });
          });
        });

        allMessages.sort((a, b) => a.timestamp - b.timestamp);
        const chatMessagesContainer = document.querySelector("#chat-messages");
        chatMessagesContainer.innerHTML = "";

        allMessages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = `${message.playerName}: ${message.text}`;
          chatMessagesContainer.appendChild(messageElement);
        });

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      });
  });
})();
