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
- A modern web browser.

### Installation

1. Navigate to where you want to store the game:
   ```sh
   cd <MyPath/File>
   ```

2. Clone the repository:
   ```sh
   git clone https://github.com/BrianWanamaker/Open-Source.git
   ```

3. Create Firebase database
   ```sh
   https://firebase.google.com/
   ```
4. Create .env and paste firebaseConfig from firebase
   ```sh
   apiKey: "exampleAPIKey"
   authDomain: "example.firebaseapp.com",
   databaseURL: "https://example.firebaseio.com",
   projectId: "open-source-example-",
   storageBucket: "open-source-example.com",
   messagingSenderId: "1234567",
   appId: "1:2345678",
   measurementId: "E-123456"
  ``

6. Install HTTP-Server
   ```sh
   https://github.com/http-party/http-server
   ```
7. Build the config file:
   ```sh
   node build.js
   ```
8. Start the game:
   ```sh
   Http-Server
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
