import { CommandRegistry } from "@classes/Command.class";
import { RageShared } from "@shared/index";

const invokeCommand = async (player: PlayerMp, message: string) => {
    message = message.substring(1);
    message = message.trim();
    const args = message.split(/ +/);
    const name = args.shift();
    if (!name) return;

    const fullText = message.substring(name.length + 1); // +1 for the space after command name

    // Check if command exists
    const command = CommandRegistry.find(name);
    if (!command) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Command does not exist!", "dark");
        return;
    }

    const cancel = { cancel: false };
    // CommandEvents.emit('receive', player, command, fullText, args, cancel);

    // Handle cancellation
    if (cancel && cancel.cancel) {
        return;
    }

    try {
        // Handle run
        if (command.adminlevel && command.adminlevel > player.getAdminLevel()) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You are not authorized to use this command.");
        }
        if (command.run.constructor.name === "AsyncFunction") {
            await command.run(player, fullText, ...args);
        } else {
            command.run(player, fullText, ...args);
        }
    } catch (e) {
        console.error(e);
    }
};

const sendChatMessage = (player: PlayerMp, msg: string) => {
    try {
        msg = msg.trim();
    } catch (err) {
        msg = msg;
    }

    if (msg.length <= 0) return;

    mp.players.forEachInRange(player.position, 15, (target) => {
        let now = new Date(),
        hours = (now.getHours() < 10 ? "0" : "") + now.getHours(),
        minutes = (now.getMinutes() < 10 ? "0" : "") + now.getMinutes(),
        seconds = (now.getSeconds() < 10 ? "0" : "") + now.getSeconds(),
        time = hours + ":" + minutes + ":" + seconds;

        const sendText = `[${time}] ${player.getRoleplayName()} says: ${msg}`;
        target.call("client::chat:newMessage", [sendText]);
    });
};

const invokeMessage = async (player: PlayerMp, data: string) => {
    const message = JSON.parse(data);
    player.call("client::chat:close");
    if (message[0] === "/" && message.length > 1) {
        return invokeCommand(player, message);
    } else {
        return sendChatMessage(player, message);
    }
};
mp.events.add("server::chat:sendMessage", invokeMessage);
