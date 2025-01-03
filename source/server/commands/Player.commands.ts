import { RAGERP } from "@api";
import { Chat } from "@modules/Chat.module";
import { RageShared } from "@shared/index";
import { Utils } from "@shared/utils.module";

RAGERP.commands.add({
    name: "me",
    run: (player: PlayerMp, fulltext) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/me [action text]");
        player.setEmoteText([194, 162, 218, 255], `** ${fulltext}`, 7);
        RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${player.getRoleplayName()} ${fulltext}`);
    }
});

RAGERP.commands.add({
    name: "w",
    aliases: ["whisper"],
    run: (player: PlayerMp, fulltext: string, targetid: string, ...text: string[]) => {
        if (!fulltext.length || !targetid.length) return RAGERP.chat.sendSyntaxError(player, "/w(hisper) [playerid] [message]");

        const target = mp.players.getPlayerByName(targetid);

        if (!target || !mp.players.exists(target) || !target.getVariable("loggedin")) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");
        if (target.id === player.id) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You can't whisper yourself.");

        if (Utils.distanceToPos(player.position, target.position) > 2.5) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "That player is far away from you.");
        player.setEmoteText([194, 162, 218, 255], `* mutters something to ${target.getRoleplayName()}`, 7);

        RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${player.getRoleplayName()} whispers something to ${target.getRoleplayName()}`);

        Chat.Message(player, `!{#FFFF00}Whisper to: ${target.getRoleplayName()}: ${text.join(" ")}`);
        Chat.Message(target, `!{#FFFF00}${player.getRoleplayName()} whispers: ${text.join(" ")}`);
    }
});

RAGERP.commands.add({
    name: "do",
    run: (player: PlayerMp, fulltext) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/do [describe action text]");
        player.setEmoteText([194, 162, 218, 255], `** ${fulltext}`, 7);
        RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${fulltext} ((${player.getRoleplayName()}))`);
    }
});

RAGERP.commands.add({
    name: "b",
    description: "Local ooc chat",
    run: (player: PlayerMp, fulltext: string) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/b [message]");
        RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#afafaf}(( ${player.name} [${player.id}]: ${fulltext} ))`);
    }
});

RAGERP.commands.add({
    name: "shout",
    aliases: ["s"],
    description: "Shoutout a message",
    run: (player: PlayerMp, fulltext: string) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/s(hout) [text]");
        player.setEmoteText([255, 255, 255, 255], `(Shouts) ${fulltext}!`, 5);
        RAGERP.chat.sendNearbyMessage(player.position, 20.0, `${player.getRoleplayName()} shouts: ${fulltext}!`);
    }
});

RAGERP.commands.add({
    name: "report",
    description: "Report someone or something",
    run: (player: PlayerMp, fulltext: string) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/report [text]");

        Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.ORANGE}Your report was sent to all on duty admins.`);
    
        const admins = mp.players.toArray().filter((x) => x.character && x.character.adminlevel > 0);

        admins.forEach((admin) => {
            if(admin.getVariable("onAdminDuty")){
                Chat.Message(admin, `!{#ffff00}[Report ${player.id}] ${player.name}: ${fulltext}`);
            }
        });

        player.setVariable("hasReport", { report: fulltext });
    }
})

RAGERP.commands.add({
    name: "time",
    description: "Check time",
    run: (player: PlayerMp) => {
        player.setEmoteText([194, 162, 218, 255], `* checks the time`, 7);
        const formattedTime = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });

          Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.NAVYBLUE}(Date and Time): ${formattedTime}.`);

    }
})

RAGERP.commands.add({
    name: "clearchat",
    aliases: [ "cc" ],
    
    run: (player: PlayerMp) => {
        for(let i = 0; i<25; i++){
            Chat.Message(player, " ");
        }
    }
})