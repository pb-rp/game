// Constants
const PAYDAY_AMOUNT = 500; // Amount the player gets paid
const PAYDAY_INTERVAL = 1000 * 60 * 60; // 1 hour in milliseconds

// A map to store the join time of each player
let playerJoinTime: Map<PlayerMp, number> = new Map();

// This function checks if the player is eligible for payday
function checkPayday(player: PlayerMp) {
    const currentTime = Date.now();

    // If the player joined less than 1 hour ago, do nothing
    if (!playerJoinTime.has(player)) {
        playerJoinTime.set(player, currentTime); // Store the join time
        return;
    }

    const joinTime = playerJoinTime.get(player)!;

    // Calculate how long the player has been online
    const timeOnline = currentTime - joinTime;

    // If player has been online for at least 1 hour (3600000 ms)
    if (timeOnline >= PAYDAY_INTERVAL) {
        // Give everything for payday

        // Update join time to reset for the next payday
        playerJoinTime.set(player, currentTime);
    }
}

// Set an interval to check every minute for eligible players (to avoid checking too often)
setInterval(() => {
    mp.players.forEach((player: PlayerMp) => {
        // Ensure the player is valid and online
        if (player) {
            checkPayday(player);
        }
    });
}, 1000 * 60); // Check every minute
