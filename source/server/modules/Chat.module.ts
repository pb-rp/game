import { RageShared } from "@shared/index";

export const Chat = {
    /**
     * Sends a syntax error message to a specific player.
     *
     * @param {PlayerMp} player - The player to whom the message will be sent.
     * @param {string} message - The message that describes the correct usage.
     * @returns {void}
     */
    sendSyntaxError(player: PlayerMp, message: string): void {
        return Chat.Message(player, `!{#FF6347}Usage:!{#ffffff} ${message}`);
    },

    /**
     * Sends a message to all players within a certain range of a specific position.
     *
     * @param {Vector3} position - The position from which the range is calculated.
     * @param {number} range - The range within which players will receive the message.
     * @param {string} message - The message to send to players.
     * @returns {void}
     */
    sendNearbyMessage(position: Vector3, range: number, message: string): void {
        mp.players.forEachInRange(position, range, (player: PlayerMp) => {
            if (player.getVariable("loggedin")) Chat.Message(player, message);
        });
    },

    /**
     * Sends a warning message to all admins with a certain level or higher.
     *
     * @param {number} color - The color code (32bit in hexadecimal) for the message.
     * @param {string} message - The warning message to send to admins.
     * @param {RageShared.Enums.ADMIN_LEVELS} [level=RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE] - The minimum admin level required to receive the message.
     * @returns {void}
     */
    sendAdminWarning(color: number, message: string, level: RageShared.Enums.ADMIN_LEVELS = RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE): void {
        const players = mp.players.toArray().filter((x) => x.character && x.character.adminlevel >= level);
        const padColor = color.toString(16).toUpperCase().padStart(8, "0").slice(0, -2);
        players.forEach((player) => {
            Chat.Message(player, `!{#${padColor}}${message}`);
        });
    },

    Message(player: PlayerMp, message: string){
        // Regex to match both named colors (e.g., !{yellow}) and hex colors (e.g., !{#FFFF00})
        let colorMatch = message.match(/!\{([a-zA-Z#0-9]+)\}/);
    
        // Default color (if no color found, can be adjusted)
        let color = "";
    
        if (colorMatch) {
            color = colorMatch[1]; // Extracted color (could be name or hex)
            message = message.replace(colorMatch[0], ""); // Remove the color part from the message
        }
    
        let now = new Date(),
            hours = (now.getHours() < 10 ? "0" : "") + now.getHours(),
            minutes = (now.getMinutes() < 10 ? "0" : "") + now.getMinutes(),
            seconds = (now.getSeconds() < 10 ? "0" : "") + now.getSeconds(),
            time = hours + ":" + minutes + ":" + seconds;
    
        // Apply the color in the output (adjust depending on how your chat system handles colors)
        player.outputChatBox(`!{${color}}[${time}] ${message}`);
    }
    
    
};
