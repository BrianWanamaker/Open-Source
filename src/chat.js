import { playerId } from "./playerData.js";
// chat features
chat();
export function chat() {
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
      const MAX_LENGTH = 40;

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
        let players = snapshot.val();
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
}
