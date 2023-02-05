import { getRandomSafeSpot, isSolid, PLAYER_COLORS, randomFromArray, getKeyString } from "./utils.js"
import bandname from 'bandname';

export const initGameState = () => {
    return {
        players: {},
        coins: generateCoins(undefined, 3)
    }
}

export const generateCoins = (coins, numberOfCoins = 1) => {
    const newCoins = {
        ...coins
    }

    for (let i = 0; i < numberOfCoins; i++) {
        const { x, y } = getRandomSafeSpot();
        newCoins[getKeyString(x, y)] = true;
    }

    return newCoins;
}

export const createNewPlayer = (id) => {
    const { x, y } = getRandomSafeSpot();
    return {
        id,
        name: bandname(),
        direction: 'right',
        color: randomFromArray(PLAYER_COLORS),
        x,
        y,
        coins: 0,
    }
}

export const checkIfPlayerIsOnCoin = (coinsState, playerX, playerY) => {
    const positionKeyString = getKeyString(playerX, playerY);
    if (coinsState[positionKeyString]) return true;
    return false;
}

export const removeCoin = (coins, x, y) => {
    const positionKeyString = getKeyString(x, y);
    delete coins[positionKeyString];
    return coins;
}

export const updatedPlayerFromMovement = (keyCode, player) => {
    const { xChange, yChange } = keyCodeToPositionChange(keyCode);
    const newX = player.x + xChange;
    const newY = player.y + yChange;
    const canMove = !isSolid(newX, newY);
    if (!canMove) return;

    return {
        ...player,
        x: newX,
        y: newY,
        direction: xChange === 0 ? player.direction
            : xChange === 1 ? 'right'
                : 'left'
    }
}

const keyCodeToPositionChange = (keyCode) => {
    const position = { xChange: 0, yChange: 0 };
    switch (keyCode) {
        case 'ArrowUp':
            position.yChange = -1;
            break;
        case 'ArrowDown':
            position.yChange = 1;
            break;
        case 'ArrowLeft':
            position.xChange = -1;
            break;
        case 'ArrowRight':
            position.xChange = 1;
            break;
    }
    return position;
}