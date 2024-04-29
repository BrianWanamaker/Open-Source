# Read Me

This is a competitive multiplayer, grid-based adventure game where players race against each other to feed NPCs and collect coins scattered around the map. Set in a vibrant, pixelated world filled with challenges, and obstacles players must strategize and navigate through blocked spaces to become the ultimate provider for the NPCs and the richest adventurer.

## Features

- **Competitive Gameplay**: Race against other players to find and feed NPCs with pizzas and coffees, and collect as many coins as you can.
- **Dynamic World**: The grid-based map features dynamically placed items, NPCs, and blocked paths, offering a unique experience with each game session.
- **Item Collection and Delivery**: Collect food items and deliver them to hungry NPCs across the map for points, while also gathering coins for additional score.
- **NPC Interaction**: Engage with various NPCs who need your help to be fed, adding a layer of challenge and strategy to the game.
- **Customizable Characters**: Choose your avatar's color and dive into the competition with a distinctive chef look.
- **Real-time Updates**: Leveraging Firebase for real-time gameplay, interacting with the game world and other players seamlessly.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- Google Chrome or Mozilla Firefox
- Git 

### Installation

1. Navigate to where you want to store the game in a terminal:
   ```txt
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
4. Set up a Realtime Database in FireBase
    ```txt
   Build -> Realtime Database -> Create Database
   ```
5. Set up Firebase Rules
   ```txt
   Realtime Database -> Rules
   Example of our FireBase Rules below
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
6. Set up Anonymous Authentication in FireBase
   ```txt
    Build -> Authentication -> Start Authentication -> Enable Anonymous Authentication
   ```
7. Create .env in root folder and paste `SDK setup and configuration` from FireBase Project Settings
   ```sh
   Example .env file:
   ```
   ```txt
   API_KEY=exampleAPIKey
   AUTH_DOMAIN=example.firebaseapp.com
   DATABASE_URL=https://example.firebaseio.com
   PROJECT_ID=open-source-example-
   STORAGE_BUCKET=open-source-example.com
   MESSAGING_SENDER_ID=1234567
   APP_ID=1:2345678
   MEASUREMENT_ID=E-123456
   ```
8. Install HTTP-Server
    - To install using npm (Node.js must be installed), run:
   ```
     npm install http-server
   ```
   - Alternatively, you can install it via Homebrew on macOS:
   ```
     brew install http-server
   ```
   - [http-server documentation](https://github.com/http-party/http-server)
9. Build the config file in terminal:
   ```sh
   node build.js
   ```
10. Start the game in terminal:
    ```txt
    http-server
    ```
The game will now be running on `http://localhost:8080/`. 

## Gameplay

- Navigate the grid with arrow keys, avoiding blocked spaces and strategizing your movements.
- Collect pizzas and coffees, and deliver them to NPCs to earn points.
- Pick up coins around the map for additional score.
- Compete against other players to be the fastest and most efficient provider and collector.

## Contributing

Contributions to this game are encouraged! If you have ideas for new features or improvements, please fork the repository and submit a pull request with your changes. Ensure your contributions adhere to the project's standards and include relevant documentation.

## License

Original Open Source Project:
 -  [Build a Multiplayer Game with JavaScript & Firebase by Drew Conley](https://youtu.be/xhURh2RDzzg)
