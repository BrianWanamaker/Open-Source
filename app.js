import { placeNPC } from "./src/npc.js";

import { placeCoin } from "./src/coins.js";

import { chat } from "./src/chat.js";

export function initGame() {
  firebase.database().ref("gameState").set({
    gameEnded: false,
    winnerId: null,
  });
}
