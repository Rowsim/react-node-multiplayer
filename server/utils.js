export const FRAME_RATE = 10;


export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function getKeyString(x, y) {
    return `${x}x${y}`;
}

export const MAP_DATA = {
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

export function isSolid(x, y) {
    const blockedNextSpace = MAP_DATA.blockedSpaces[getKeyString(x, y)];
    return (
        blockedNextSpace ||
        x >= MAP_DATA.maxX ||
        x < MAP_DATA.minX ||
        y >= MAP_DATA.maxY ||
        y < MAP_DATA.minY
    )
}

export const SAFE_SPOTS = [
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
];

export function getRandomSafeSpot() {
    return randomFromArray(SAFE_SPOTS);
}

export const PLAYER_COLORS = ["blue", "red", "orange", "yellow", "green", "purple"];