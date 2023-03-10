import { createServer } from "http";
import { Server } from "socket.io";
import {
  checkIfPlayerIsOnCoin,
  createNewPlayer,
  generateCoins,
  initGameState,
  removeCoin,
  updatedPlayerFromMovement,
  doesPlayerHaveMostCoins,
} from "./game.js";
import { FRAME_RATE } from "./utils.js";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        // origin: "http://mp-demo-client-dev.s3.eu-west-2.amazonaws.com",
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const gameState = initGameState();

io.on('connection', socket => {
    socket.on('disconnect', (reason) => {
        console.debug(`disconnect for id: ${socket.id}`, reason);
        delete gameState.players[socket.id];
    })

    console.debug(`new connection with id: ${socket.id}`);
    const id = socket.id;
    gameState.players[id] = createNewPlayer(id);


    const handleKeydown = (keyCode) => {
        if (!keyCode) return;
        const updatedPlayer = updatedPlayerFromMovement(keyCode, gameState.players[id]);
        if (!updatedPlayer) return;
        if (checkIfPlayerIsOnCoin(gameState.coins, updatedPlayer.x, updatedPlayer.y)) {
            updatedPlayer.coins += 1;
            const updatedCoins = removeCoin(gameState.coins, updatedPlayer.x, updatedPlayer.y);
            gameState.coins = generateCoins(updatedCoins);

            if (
              !gameState.general.playerIdWithMostCoins ||
              doesPlayerHaveMostCoins(
                updatedPlayer.coins,
                gameState.players[gameState.general.playerIdWithMostCoins].coins
              )
            ) {
              gameState.general.playerIdWithMostCoins = id;
            }
        }
        gameState.players[id] = updatedPlayer;
    }
    socket.on('keydown', handleKeydown);

    const handleChatMessage = (message) => {
        if (!message) return;
        const player = gameState.players[id];
        player.messages.push(message);
        setTimeout(() => {
            player.messages.shift();
        }, 5000);
    };
    socket.on('chatMessage', handleChatMessage);

    const handleChangeName = (name) => {
        if (!name) return;
        const player = gameState.players[id];
        player.name = name;
    }
    socket.on('changeName', handleChangeName);

    startGameInterval(socket, gameState);
});

const startGameInterval = (socket, state) => {
    const intervalId = setInterval(() => {
        socket.emit('gameState', JSON.stringify(state));
    }, 1000 / FRAME_RATE);
}

const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});