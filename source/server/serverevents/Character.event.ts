import { RAGERP } from "@api";
import { CharacterEntity } from "@entities/Character.entity";
import { InventoryItemsEntity } from "@entities/Inventory.entity";
import { inventorydataPresset } from "@modules/inventory/Assets.module";
import { Inventory } from "@modules/inventory/Core.class";
import { RageShared } from "@shared/index";

/**
 * When a player changes navigation in character creator, example going from general data to appearance
 */
RAGERP.cef.register("creator", "navigation", async (player: PlayerMp, name: string) => {
    name = JSON.parse(name);

    const cameraName = "creator_" + name;
    player.call("client::creator:changeCamera", [cameraName]);
    player.call("client::creator:changeCategory", [cameraName]);
});

/**
 * Executed when a player selects a character to spawn with
 */
RAGERP.cef.register("character", "select", async (player: PlayerMp, data: string) => {
    const id = JSON.parse(data);

    const character = await RAGERP.database.getRepository(CharacterEntity).findOne({ where: { id }, relations: ["items", "bank"] });
    if (!character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "An error occurred selecting your character.");

    player.character = character;

    player.setVariable("loggedin", true);
    player.call("client::auth:destroyCamera");
    player.call("client::cef:close");

    player.model = character.gender === 0 ? mp.joaat("mp_m_freemode_01") : mp.joaat("mp_f_freemode_01");
    player.name = player.character.name;
    await player.character.spawn(player);

    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Welcome, ${player.character.name}!`);
});
/**
 * Executes when a player choose to create a new character
 */
RAGERP.cef.register("character", "create", async (player: PlayerMp) => {
    player.call("client::auth:destroyCamera");

    player.call("client::creator:start");
    RAGERP.cef.emit(player, "system", "setPage", "creator")
});
/**
 * Executes when a player finishes creating a character.
 */
RAGERP.cef.register("creator", "create", async (player, data) => {
    if (!player.account) return player.kick("An error has occurred!");

    const parseData = RAGERP.utils.parseObject(data);
    const fullname = `${parseData.name.firstname} ${parseData.name.lastname}`;

    const nameisTaken = await RAGERP.database.getRepository(CharacterEntity).findOne({ where: { name: fullname } });
    if (nameisTaken) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "We're sorry but that name is already taken, choose another one.");
    const { sex, parents, hair, face, color }: RageShared.Players.Interfaces.CreatorData = parseData;

    const characterLimit = await RAGERP.database.getRepository(CharacterEntity).find({ where: { account: { id: player.account.id } }, take: 3 });

    if (characterLimit.length > 2) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "We're sorry but you already have three characters, you cannot create anymore.");

    const characterData = new CharacterEntity();
    characterData.account = player.account;
    characterData.appearance = { color, face, hair, parents };
    characterData.name = fullname;
    characterData.gender = sex;

    characterData.position = {
        x: -667.97412109375,
        y: 5813.35400390625,
        z: 17.51830291748047,
        heading: 0
    };

    const inv = inventorydataPresset;
    characterData.inventory = new Inventory(player, inv.clothes, inv.pockets, inv.quickUse);

    const inventoryItems = new InventoryItemsEntity();

    inventoryItems.clothes = characterData.inventory.items.clothes;
    inventoryItems.pockets = characterData.inventory.items.pockets;
    inventoryItems.quickUse = characterData.inventory.quickUse;
    inventoryItems.character = characterData;
    characterData.items = inventoryItems;

    const result = await RAGERP.database.getRepository(CharacterEntity).save(characterData);
    if (!result) return;

    player.name = fullname;
    player.character = result;
    player.setVariable("loggedin", true);

    player.call("client::creator:destroycam");
    player.call("client::cef:close");

    await player.character.spawn(player);
});
