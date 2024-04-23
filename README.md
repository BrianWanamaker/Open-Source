# Read Me

This is a competitive multiplayer, grid-based adventure game where players race against each other to feed NPCs and collect coins scattered around the map. Set in a vibrant, pixelated world filled with challenges, obstacles players must strategize and navigate through blocked spaces to become the ultimate provider for the NPCs and the richest adventurer.

## Features

- **Competitive Gameplay**: Race against other players to find and feed NPCs with pizzas and coffees, and collect as many coins as you can.
- **Dynamic World**: The grid-based map features dynamically placed items, NPCs, and blocked paths, offering a unique experience with each game session.
- **Item Collection and Delivery**: Collect food items and deliver them to hungry NPCs across the map for points, while also gathering coins for additional score.
- **NPC Interaction**: Engage with various NPCs who need your help to be fed, adding a layer of challenge and strategy to the game.
- **Customizable Characters**: Choose your avatar's color and dive into the competition with a distinctive chef look.
- **Real-time Updates**: Leveraging Firebase for real-time gameplay, interact with the game world and other players seamlessly.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- Google Chrome or Mozilla Firefox
- Git 

### Installation

1. Navigate to where you want to store the game in a terminal:
   ```sh
   cd <MyPath/File>
   ```
2. Clone the repository:
   ```sh
   git clone https://github.com/BrianWanamaker/Open-Source.git
   ```
3. Create a Firebase database
   ```sh
   Open a Web Browser and create a FireBase Database at https://firebase.google.com/
   ```
4. Set up a Realtime Database
    ```sh
   Build -> Realtime Database -> Create Database
   ```
5. Set up Firebase Rules
   ```sh
   Realtime Database -> Rules
   Example of FireBase Rules:
   ```
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null",
       "players": {
         "$uid": {
           ".write": "$uid === auth.uid",
           "itemsHeld": {
             "$item": {
               ".validate": "newData.isBoolean()"
             }
           }
         }
       },
       "gameState": {
         "items": {
           "$item_id": {
             ".write": "(!data.child('available').exists() || data.child('available').val() === true) && newData.child('available').val() === false"
           }
         }
       },
       "coins": {
         ".write": "auth != null"
       },
       "npcs": {
         ".write": "auth != null"
       },
       "chatMessages": {
         ".indexOn": ["timestamp"],
         ".write": "auth != null"
       },
       "activePlayersCount": {
         ".validate": "newData.isNumber()"
       }
     }
   }
   ```
6. Create .env in root folder and paste `SDK setup and configuration` from FireBase Project Settings
   ```sh
   Example .env file:
   ```
   ```txt
   apiKey: "exampleAPIKey"
   authDomain: "example.firebaseapp.com",
   databaseURL: "https://example.firebaseio.com",
   projectId: "open-source-example-",
   storageBucket: "open-source-example.com",
   messagingSenderId: "1234567",
   appId: "1:2345678",
   measurementId: "E-123456"
   ```
7. Install HTTP-Server
    - To install using npm (Node.js must be installed), run:
   ```
     npm install http-server
   ```
   - Alternatively, you can install it via Homebrew on macOS:
   ```
     brew install http-server
   ```
   - [http-server documentation](https://github.com/http-party/http-server)
8. Build the config file in terminal:
   ```sh
   node build.js
   ```
9. Start the game in terminal:
   ```sh
   http-server in terminal
   ```
The game will now be running on `http://localhost:8080/`. 

## Gameplay

- Navigate the grid with arrow keys, avoiding blocked spaces and strategizing your movements.
- Collect pizzas and coffees, and deliver them to NPCs to earn points.
- Pick up coins around the map for additional score.
- Compete against other players to be the fastest and most efficient provider and collector.

## Contributing

Contributions to this game is encouraged! If you have ideas for new features or improvements, please fork the repository and submit a pull request with your changes. Ensure your contributions adhere to the project's standards and include relevant documentation.

## License

Original Open Source Project:

```sh
https://youtu.be/xhURh2RDzzg
```
