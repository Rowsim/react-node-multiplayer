import { createServer } from "http";
import { Server } from "socket.io";
import { checkIfPlayerIsOnCoin, createNewPlayer, generateCoins, initGameState, removeCoin, updatedPlayerFromMovement } from './game.js';
import { FRAME_RATE } from "./utils.js";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://mp-demo-client-dev.s3.eu-west-2.amazonaws.com",
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
            const coins = removeCoin(gameState.coins, updatedPlayer.x, updatedPlayer.y);
            gameState.coins = generateCoins(coins);
        }
        gameState.players[id] = updatedPlayer;
    }
    socket.on('keydown', handleKeydown);

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