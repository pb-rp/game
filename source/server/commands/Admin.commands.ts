import { RAGERP } from "@api";
import { CharacterEntity } from "@entities/Character.entity";
import { inventoryAssets } from "@modules/inventory/Items.module";
import { RageShared } from "@shared/index";
import { adminTeleports } from "@assets/Admin.asset";
import { Chat } from "@modules/Chat.module";

RAGERP.commands.add({
    name: "goto",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fulltext: string, targetorpos: string) => {
        const showAvailableLocations = () => {
            RAGERP.chat.sendSyntaxError(player, "/goto [player/location]");
            const keys = Object.keys(adminTeleports);
            for (let i = 0; i < keys.length; i += 8) {
                const chunk = keys.slice(i, i + 8);
                Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.YELLOW}Available locations: ${RageShared.Enums.STRINGCOLORS.GREY} ${chunk.join(", ")}`);
            }
        };

        if (!fulltext.length || !targetorpos.length) {
            showAvailableLocations();
            return;
        }

        const targetplayer = mp.players.getPlayerByName(targetorpos);

        if (targetplayer && mp.players.exists(targetplayer)) {
            player.position = targetplayer.position;
            player.dimension = targetplayer.dimension;
            player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported to ${targetplayer.name}`);
        } else {
            const targetpos = adminTeleports[targetorpos];
            if (targetpos) {
                player.position = targetpos;
                player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported to ${targetorpos}`);
            } else {
                showAvailableLocations();
            }
        }
    }
});

RAGERP.commands.add({
    name: "gethere",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fulltext: string, target: string) => {
        if (!fulltext.length || !target.length) {
            return RAGERP.chat.sendSyntaxError(player, "/gethere [player]");
        }

        const targetplayer = mp.players.getPlayerByName(target);
        if (!targetplayer || !mp.players.exists(targetplayer) || !targetplayer.character) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");
        }

        if (targetplayer.vehicle) {
            targetplayer.vehicle.position = player.position;
            targetplayer.vehicle.dimension = player.dimension;
        }

        targetplayer.position = player.position;
        targetplayer.dimension = player.dimension;

        targetplayer.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `Admin ${player.name} has teleported you to their position.`);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You teleported ${targetplayer.name} to your position.`);
    }
});

RAGERP.commands.add({
    name: "ah",
    aliases: ["adminhelp", "admincmds", "acmds"],
    adminlevel: 1,
    run: (player: PlayerMp) => {
        const adminCommandsByLevel: { [level: number]: string[] } = {};

        const adminLevels: { [key: number]: string } = {
            1: `${RageShared.Enums.STRINGCOLORS.LIGHTGREEN}[Admin Level 1]`,
            2: `${RageShared.Enums.STRINGCOLORS.LIGHTGREEN}[Admin Level 2]`,
            3: `${RageShared.Enums.STRINGCOLORS.LIGHTGREEN}[Admin Level 3]`,
            4: `${RageShared.Enums.STRINGCOLORS.GREEN}[Admin Level 4]`,
            5: `${RageShared.Enums.STRINGCOLORS.GREEN}[Admin Level 5]`,
            6: `${RageShared.Enums.STRINGCOLORS.GREEN}[Admin Level 6]`
        };

        RAGERP.commands
            .getallCommands()
            .filter((cmd) => {
                return player.character && typeof cmd.adminlevel === "number" && cmd.adminlevel > 0 && cmd.adminlevel <= player.character.adminlevel;
            })
            .forEach((cmd) => {
                if (!cmd.adminlevel) return;
                if (!adminCommandsByLevel[cmd.adminlevel]) {
                    adminCommandsByLevel[cmd.adminlevel] = [];
                }
                adminCommandsByLevel[cmd.adminlevel].push(`/${cmd.name}`);
            });

        for (const level in adminCommandsByLevel) {
            if (adminCommandsByLevel.hasOwnProperty(level)) {
                const commands = adminCommandsByLevel[level];
                const itemsPerLog = 5;
                for (let i = 0; i < commands.length; i += itemsPerLog) {
                    const endIndex = Math.min(i + itemsPerLog, commands.length);
                    const currentItems = commands.slice(i, endIndex);

                    Chat.Message(player, `${adminLevels[level]}: !{white}${currentItems.join(", ")}`);
                }
            }
        }
    }
});

RAGERP.commands.add({
    name: "a",
    aliases: ["adminchat"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fulltext: string) => {
        if (!fulltext.length) return RAGERP.chat.sendSyntaxError(player, "/a [text]");

        const admins = mp.players.toArray().filter((x) => x.character && x.character.adminlevel > 0);

        admins.forEach((admin) => {
            Chat.Message(admin, `!{#ffff00}[A] ${player.name}: ${fulltext}`);
        });
    }
});

RAGERP.commands.add({
    name: "admins",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp) => {
        Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.GREY}Online Admins:`);
        mp.players.forEach((target) => {
            if (target && target.character && target.character.adminlevel) {
                if(target.getVariable("onAdminDuty")){
                    Chat.Message(player, `!{white}(Level: ${target.character.adminlevel}) ${target.name} (${target.account?.username}) | ${RageShared.Enums.STRINGCOLORS.DGREEN}Admin Duty: On`);
                } else {
                    Chat.Message(player, `!{white}(Level: ${target.character.adminlevel}) ${target.name} (${target.account?.username}) | ${RageShared.Enums.STRINGCOLORS.RED}Admin Duty: Off`);
                }
            }
        });
    }
});

RAGERP.commands.add({
    name: "veh",
    aliases: ["vehicle", "spawnveh", "spawncar"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fullText: string, vehicleModel: string) => {
        if (!fullText.length || !vehicleModel.length) return RAGERP.chat.sendSyntaxError(player, "/veh [vehiclemodel]");

        const vehicle = new RAGERP.entities.vehicles.new(RageShared.Vehicles.Enums.VEHICLETYPES.ADMIN, vehicleModel, player.position, player.heading, player.dimension);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Successfully spawned ${vehicleModel} (${vehicle.getId()})`);
        RAGERP.chat.sendAdminWarning(RageShared.Enums.HEXCOLORS.LIGHTRED, `AdmWarn: ${player.name} (${player.id}) has spawned a vehicle (Model: ${vehicleModel} | ID: ${vehicle.getId()}).`);
    }
});

RAGERP.commands.add({
    name: "dim",
    aliases: ["setdimension", "setdim"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, fullText: string, target: string, dimension: string) => {
        if (!fullText.length || !target.length || !dimension.length) return RAGERP.chat.sendSyntaxError(player, "/setdimension [target] [dimension]");

        const parseTarget = parseInt(target);
        if (isNaN(parseTarget)) return RAGERP.chat.sendSyntaxError(player, "/setdimension [target] [dimension]");

        const parseDimension = parseInt(dimension);
        if (isNaN(parseDimension)) return RAGERP.chat.sendSyntaxError(player, "/setdimension [target] [dimension]");

        const targetPlayer = mp.players.at(parseTarget);
        if (!targetPlayer || !mp.players.exists(targetPlayer)) return RAGERP.chat.sendSyntaxError(player, "/setdimension [target] [dimension]");

        targetPlayer.dimension = parseDimension;

        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `You've successfully changed ${targetPlayer.name} dimension to ${parseDimension}`);
        targetPlayer.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `Administrator ${player.name} changed your dimension to ${parseDimension}`);
    }
});
RAGERP.commands.add({
    name: "makeadmin",
    aliases: ["setadmin"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    description: "Make a player admin",
    run: async (player: PlayerMp, fullText: string, target: string, level: string) => {
        if (!fullText.length || !target.length || !level.length) return RAGERP.chat.sendSyntaxError(player, "/makeadmin [target] [level]");
        const targetId = parseInt(target);
        const adminLevel = parseInt(level);

        if (adminLevel < 0 || adminLevel > 6) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Admin level must be between 0 and 6");

        const targetPlayer = mp.players.at(targetId);
        if (!targetPlayer || !mp.players.exists(targetPlayer) || !targetPlayer.character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");

        targetPlayer.character.adminlevel = adminLevel;
        targetPlayer.setVariable("adminLevel", targetPlayer.character.adminlevel);
        await RAGERP.database.getRepository(CharacterEntity).update(targetPlayer.character.id, { adminlevel: adminLevel });
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `You've successfully made ${targetPlayer.name} an admin level ${adminLevel}`);
        targetPlayer.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `${player.name} has made you an admin level ${adminLevel}`);

        RAGERP.chat.sendAdminWarning(
            RageShared.Enums.HEXCOLORS.LIGHTRED,
            adminLevel > 0
                ? `AdmWarn: ${player.name} (${player.id}) has made ${targetPlayer.name} (${targetPlayer.id}) a level ${adminLevel} admin.`
                : `AdmWarn: ${player.name} (${player.id}) has removed ${targetPlayer.name} admin level.`
        );

        RAGERP.commands.reloadCommands(targetPlayer);
    }
});

RAGERP.commands.add({
    name: "adminduty",
    aliases: ["aduty"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    description: "Get on admin duty",
    run: (player: PlayerMp) => {
        const adminDuty = player.getVariable("onAdminDuty");

        if(!adminDuty){
            player.setVariable("onAdminDuty", !adminDuty);

            Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.DGREEN}You are now on admin duty.`);
            return;
        }

        player.setVariable("onAdminDuty", !adminDuty);
        Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.RED}You are now off admin duty.`);
        return;
    }
})

RAGERP.commands.add({
    name: "spectate",
    aliases: ["spec"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    description: "Spectate a player",
    run: (player: PlayerMp, fullText: string, target) => {
        if (fullText.length === 0) return RAGERP.chat.sendSyntaxError(player, "/spectate [target/off]");

        const parsedTarget = parseInt(target);

        if (isNaN(parsedTarget) && target === "off") {
            player.call("client::spectate:stop");
            player.setVariable("isSpectating", false);
            if (player.lastPosition) player.position = player.lastPosition;
            return;
        }

        const targetPlayer = mp.players.at(parsedTarget);
        if (!targetPlayer || !mp.players.exists(targetPlayer)) return;

        if (targetPlayer.id === player.id) return Chat.Message(player, "!{red}Error: You can't spectate yourself.");

        if (!player || !mp.players.exists(player)) return;

        if (player.getVariable("isSpectating")) {
            player.call("client::spectate:stop");
            if (player.lastPosition) player.position = player.lastPosition;
        } else {
            player.lastPosition = player.position;
            player.position = new mp.Vector3(targetPlayer.position.x, targetPlayer.position.y, targetPlayer.position.z - 15);
            if (!player || !mp.players.exists(player) || !targetPlayer || !mp.players.exists(targetPlayer)) return;
            player.call("client::spectate:start", [target]);
        }
        player.setVariable("isSpectating", !player.getVariable("isSpectating"));
    }
});

RAGERP.commands.add({
    name: "destroyveh",
    aliases: ["destroyvehicles", "destroycar", "destroycars"],
    description: "Destroy admin spawned vehicles",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp) => {
        if (player.vehicle) {
            const vehicleData = RAGERP.entities.vehicles.manager.at(player.vehicle.id);
            if (!vehicleData) return;
            vehicleData.destroy();
            return;
        }
        const adminVehicles = RAGERP.entities.vehicles.pool.filter((x) => x.type === RageShared.Vehicles.Enums.VEHICLETYPES.ADMIN);
        adminVehicles.forEach((vehicle) => vehicle.destroy());
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `You've successfully deleted all admin spawned vehicles.`);
        RAGERP.chat.sendAdminWarning(RageShared.Enums.HEXCOLORS.LIGHTRED, `AdmWarn: ${player.name} (${player.id}) has destroyed all admin spawned vehicles.`);
    }
});

RAGERP.commands.add({
    name: "revive",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    description: "Revive a player",
    run: async (player: PlayerMp, fulltext: string, target: string) => {
        if (!fulltext.length || !target.length) return RAGERP.chat.sendSyntaxError(player, "Usage: /revive [targetplayer]");

        const parseTarget = parseInt(target);
        if (isNaN(parseTarget)) return RAGERP.chat.sendSyntaxError(player, "Usage: /revive [targetplayer]");

        const targetPlayer = mp.players.getPlayerByName(target);

        if (!targetPlayer || !mp.players.exists(targetPlayer) || !targetPlayer.character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");
        if (targetPlayer.character.deathState !== RageShared.Players.Enums.DEATH_STATES.STATE_INJURED) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "That player is not injured.");

        targetPlayer.spawn(targetPlayer.position);
        targetPlayer.character.deathState = RageShared.Players.Enums.DEATH_STATES.STATE_NONE;

        targetPlayer.character.setStoreData(player, "isDead", false);
        targetPlayer.setVariable("isDead", false);
        targetPlayer.stopScreenEffect("DeathFailMPIn");
        targetPlayer.stopAnimation();

        await targetPlayer.character.save(targetPlayer);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `You successfully revived ${targetPlayer.name}`);
        targetPlayer.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `You were revived by admin ${player.name}`);
        RAGERP.chat.sendAdminWarning(RageShared.Enums.HEXCOLORS.LIGHTRED, `AdmWarn: ${player.name} (${player.id}) has revived player ${targetPlayer.name} (${targetPlayer.id}).`);
    }
});

RAGERP.commands.add({
    name: "givemoney",
    aliases: ["givecash"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, target: string, amount: string) => {
        if (!fulltext.length || !target.length || !amount.length) return RAGERP.chat.sendSyntaxError(player, "/givemoney [player] [amount]");

        const targetPlayer = mp.players.getPlayerByName(target);
        if (!targetPlayer || !mp.players.exists(targetPlayer) || !targetPlayer.character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");

        const money = parseInt(amount);
        if (isNaN(money) || money > 50000000) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid amount of money specified.");

        targetPlayer.giveMoney(money);

        targetPlayer.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, `You received ${money} cash from admin ${player.name}`);
        RAGERP.chat.sendAdminWarning(RageShared.Enums.HEXCOLORS.LIGHTRED, `AdmWarn: ${player.name} (${player.id}) has given ${targetPlayer.name} (${targetPlayer.id}) $${money}.`);
    }
});

RAGERP.commands.add({
    name: "giveclothes",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, target: string, item: RageShared.Inventory.Enums.ITEM_TYPES, comp: string, drawable: string, texture: string) => {
        if (!fulltext.length || !target.length || !item.length || !comp.length || !drawable.length || !texture.length) {
            RAGERP.chat.sendSyntaxError(player, `Usage: /giveclothes [player] [cloth_name] [component] [drawable] [texture]`);
            Chat.Message(player,
                `Clothing Names: ${Object.values(inventoryAssets.items)
                    .filter((x) => x.typeCategory === RageShared.Inventory.Enums.ITEM_TYPE_CATEGORY.TYPE_CLOTHING)
                    .map((e) => e.type.toLowerCase())
                    .join(", ")}`
            );
            return;
        }

        const targetplayer = mp.players.getPlayerByName(target);
        if (!targetplayer || !mp.players.exists(targetplayer) || !targetplayer.character || !targetplayer.character.inventory)
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");

        const itemData = targetplayer.character.inventory.addClothingItem(item, { component: parseInt(comp), drawable: parseInt(drawable), texture: parseInt(texture) });

        targetplayer.showNotify(
            itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
            itemData ? `You received a ${itemData.name}` : `An error occurred giving you the item.`
        );
        player.showNotify(
            itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
            itemData ? `You gave a ${itemData.name} to ${targetplayer.name} (${targetplayer.id})` : `An error occurred giving the item to ${targetplayer.name}.`
        );
    }
});

RAGERP.commands.add({
    name: "giveitem",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, target: string, item: RageShared.Inventory.Enums.ITEM_TYPES, count: string) => {
        if (!fulltext.length || !target.length || !item.length) return RAGERP.chat.sendSyntaxError(player, "/giveitem [player] [item type] [count]");

        const targetplayer = mp.players.getPlayerByName(target);

        if (!targetplayer || !mp.players.exists(targetplayer) || !targetplayer.character || !targetplayer.character.inventory) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Invalid player specified.");
        }
        const itemData = targetplayer.character.inventory.addItem(item);

        if (itemData) {
            itemData.count = isNaN(parseInt(count)) ? 0 : parseInt(count);
            if (!itemData.options.includes("split") && itemData.count > 1) itemData.options.push("split");
        }
        targetplayer.showNotify(
            itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
            itemData ? `You received a ${itemData.name} (x${itemData.count}) from admin ${player.name}` : `An error occurred giving u the item.`
        );
        player.showNotify(
            itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
            itemData ? `You spawned a ${itemData.name} (x${itemData.count}) to ${targetplayer.name} (${targetplayer.id})` : `An error occurred giving the item.`
        );
    }
});

RAGERP.commands.add({
    name: "acceptreport",
    aliases: ["ar"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    
    run: (player: PlayerMp, target: string) => {
        const targetplayer = mp.players.getPlayerByName(target);

        if (targetplayer && mp.players.exists(targetplayer)) {
            if(targetplayer.getVariable("hasReport")){
                Chat.Message(player, `!{yellow}You accepted ${targetplayer.name}'s report.`);
                Chat.Message(targetplayer, `${RageShared.Enums.STRINGCOLORS.ORANGE}Your report was accepted by ${player.name}.`);
                targetplayer.setVariable("hasReport", null);
            } else {
                Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.LIGHTRED}This player does not have an active report!`);
            }
        } 
    }
})

RAGERP.commands.add({
    name: "reports",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,

    run: (player: PlayerMp) => {
        Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.YELLOW2}Active Reports:`)
        mp.players.forEach((targets) => {
            if(targets && targets.getVariable("hasReport")){
                const parseReport = targets.getVariable("hasReport");
                Chat.Message(player, `${RageShared.Enums.STRINGCOLORS.GREY1}[Report ${targets.id}] ${targets.name} | Report: ${parseReport.report}`);
            }
        });
    }
});