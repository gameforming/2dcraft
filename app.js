console.log("Starting 2D World...");


// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


// ==========================================
// WORLD SETTINGS
// ==========================================

const TILE_SIZE = 32;
const CHUNK_SIZE = 32;

const WORLD_SEED = 123456;




// ==========================================current dingus

let currentLayer = 2;
// ==========================================
// PLAYER
// ==========================================

const player = {

    x: 0,
    y: 0,

    width: 28,
    height: 28,

    speed: 180

};


// ==========================================
// CAMERA
// ==========================================

const camera = {
    x: 0,
    y: 0
};


// ==========================================
// INPUT
// ==========================================

const keys = {};

const mouse = {
    x: 0,
    y: 0,

    left: false,
    right: false
};


window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;


        // Inventory

        if (
            key === "e" &&
            !event.repeat
        ) {

            toggleInventory();

        }


        // Hotbar 1-9

        if (
            key >= "1" &&
            key <= "9"
        ) {

            const slot =
                Number(key) - 1;

            selectHotbarSlot(slot);

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();

        mouse.x =
            event.clientX -
            rect.left;

        mouse.y =
            event.clientY -
            rect.top;

    }
);


canvas.addEventListener(
    "mousedown",
    event => {

        if (event.button === 0) {
            mouse.left = true;
        }

        if (event.button === 2) {
            mouse.right = true;
        }

    }
);


window.addEventListener(
    "mouseup",
    event => {

        if (event.button === 0) {
            mouse.left = false;
        }

        if (event.button === 2) {
            mouse.right = false;
        }

    }
);


// Voorkom rechtermuisknop-menu

canvas.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ==========================================
// SEEDED RANDOM
// ==========================================

function seededRandom(
    x,
    y,
    extra = 0
) {

    let value =
        x * 374761393 +
        y * 668265263 +
        WORLD_SEED * 982451653 +
        extra * 12345;


    value =
        Math.sin(value) *
        43758.5453;


    return (
        value -
        Math.floor(value)
    );

}


// ==========================================
// WORLD HASH
// ==========================================

function worldHash(
    x,
    y,
    extra = 0
) {

    const value =
        x * 73856093 ^
        y * 19349663 ^
        WORLD_SEED * 83492791 ^
        extra * 2654435761;


    return Math.abs(value);

}


// ==========================================
// TREES
// ==========================================

function isTreeCenter(
    x,
    y
) {

    return (
        seededRandom(
            x,
            y,
            50
        ) < 0.008
    );

}


function getBuildTile(
    worldX,
    worldY
) {

    // LOG

    if (
        isTreeCenter(
            worldX,
            worldY
        )
    ) {

        return "log";

    }


    // LEAVES

    for (
        let offsetY = -1;
        offsetY <= 1;
        offsetY++
    ) {

        for (
            let offsetX = -1;
            offsetX <= 1;
            offsetX++
        ) {

            if (
                offsetX === 0 &&
                offsetY === 0
            ) {

                continue;

            }


            const treeX =
                worldX -
                offsetX;


            const treeY =
                worldY -
                offsetY;


            if (
                isTreeCenter(
                    treeX,
                    treeY
                )
            ) {

                return "leaves";

            }

        }

    }


    return null;

}


// ==========================================
// ORES
// ==========================================

function getOreAt(
    worldX,
    worldY
) {

    for (
        let centerY =
            worldY - 2;

        centerY <=
            worldY + 2;

        centerY++
    ) {

        for (
            let centerX =
                worldX - 2;

            centerX <=
                worldX + 2;

            centerX++
        ) {

            const random =
                seededRandom(
                    centerX,
                    centerY,
                    100
                );


            let oreType = null;


            if (
                random < 0.0004
            ) {

                oreType =
                    "diamond";

            }
            else if (
                random < 0.0015
            ) {

                oreType =
                    "gold";

            }
            else if (
                random < 0.006
            ) {

                oreType =
                    "iron";

            }
            else if (
                random < 0.02
            ) {

                oreType =
                    "coal";

            }


            if (!oreType) {
                continue;
            }


            const pattern =
                worldHash(
                    centerX,
                    centerY,
                    200
                ) % 4;


            if (
                pattern === 0 &&
                worldX >= centerX &&
                worldX <= centerX + 1 &&
                worldY >= centerY &&
                worldY <= centerY + 1
            ) {

                return oreType;

            }


            if (
                pattern === 1 &&
                worldY === centerY &&
                worldX >= centerX &&
                worldX <= centerX + 3
            ) {

                return oreType;

            }


            if (
                pattern === 2 &&
                worldX === centerX &&
                worldY >= centerY &&
                worldY <= centerY + 3
            ) {

                return oreType;

            }


            if (
                pattern === 3
            ) {

                const positions = [

                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [2, 1]

                ];


                for (
                    const position
                    of positions
                ) {

                    if (
                        worldX ===
                        centerX +
                        position[0] &&

                        worldY ===
                        centerY +
                        position[1]
                    ) {

                        return oreType;

                    }

                }

            }

        }

    }


    return null;

}


// ==========================================
// TILE DATA
// ==========================================

const BLOCKS = {

    grass: {
        hardness: 5,
        drop: "grass"
    },

    stone: {
        hardness: 5,
        drop: "stone"
    },

    coal: {
        hardness: 5,
        drop: "coal"
    },

    iron: {
        hardness: 5,
        drop: "iron"
    },

    gold: {
        hardness: 7,
        drop: "gold"
    },

    diamond: {
        hardness: 10,
        drop: "diamond"
    },

    log: {
        hardness: 5,
        drop: "log"
    },

    leaves: {
        hardness: 1,
        drop: null
    }

};


// ==========================================
// TOOLS
// ==========================================

const TOOLS = {

    hand: {

        name: "Hand",

        level: 0,

        speed: 1

    },


    wooden_pickaxe: {

        name: "Wooden Pickaxe",

        level: 1,

        speed: 2

    },


    stone_pickaxe: {

        name: "Stone Pickaxe",

        level: 2,

        speed: 3

    },


    iron_pickaxe: {

        name: "Iron Pickaxe",

        level: 3,

        speed: 4

    },


    diamond_pickaxe: {

        name: "Diamond Pickaxe",

        level: 4,

        speed: 6

    }

};


// ==========================================
// INVENTORY
// ==========================================

const inventory = {

    slots: Array(36).fill(null),

    selectedHotbar: 0

};


// Give player starter wood

inventory.slots[0] = {

    id: "log",
    amount: 10

};


// ==========================================
// CRAFTING RECIPES
// ==========================================

const RECIPES = [

    {

        id: "wooden_pickaxe",

        output: 1,

        ingredients: {

            log: 3

        }

    },

    {

        id: "stone_pickaxe",

        output: 1,

        ingredients: {

            stone: 3

        }

    },

    {

        id: "iron_pickaxe",

        output: 1,

        ingredients: {

            iron: 3

        }

    },

    {

        id: "diamond_pickaxe",

        output: 1,

        ingredients: {

            diamond: 3

        }

    }

];


// ==========================================
// INVENTORY UI
// ==========================================

let inventoryOpen = false;


function toggleInventory() {

    inventoryOpen =
        !inventoryOpen;


    const overlay =
        document.getElementById(
            "inventoryOverlay"
        );


    overlay.classList.toggle(
        "open",
        inventoryOpen
    );


    if (inventoryOpen) {

        mouse.left = false;
        mouse.right = false;

    }

}


function selectHotbarSlot(slot) {

    if (
        slot < 0 ||
        slot > 8
    ) {

        return;

    }


    inventory.selectedHotbar =
        slot;


    document
        .querySelectorAll(
            ".hotbarSlot"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "selected"
                );

            }
        );


    const selected =
        document.querySelector(
            `.hotbarSlot[data-slot="${slot}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

    }


    updateToolDebug();

}


// ==========================================
// CURRENT ITEM
// ==========================================

function getSelectedItem() {

    return inventory.slots[
        inventory.selectedHotbar
    ];

}


// ==========================================
// CURRENT TOOL
// ==========================================

function getCurrentTool() {

    const item =
        getSelectedItem();


    if (
        !item ||
        !TOOLS[item.id]
    ) {

        return TOOLS.hand;

    }


    return TOOLS[item.id];

}


// ==========================================
// DEBUG TOOL
// ==========================================

const toolText =
    document.getElementById(
        "toolText"
    );


function updateToolDebug() {

    const tool =
        getCurrentTool();


    toolText.textContent =
        tool.name;

}


// ==========================================
// BLOCK LOOKUP
// ==========================================

function getTile(
    worldX,
    worldY,
    layer
) {

    if (layer === 1) {

        const ore =
            getOreAt(
                worldX,
                worldY
            );


        if (ore) {

            return ore;

        }


        return "stone";

    }


    if (layer === 2) {

        return "grass";

    }


    if (layer === 3) {

        return getBuildTile(
            worldX,
            worldY
        );

    }


    return null;

}


// ==========================================
// IMAGES
// ==========================================

const images = {

    grass: new Image(),

    stone: new Image(),

    coal: new Image(),

    iron: new Image(),

    gold: new Image(),

    diamond: new Image(),

    log: new Image(),

    leaves: new Image(),

    player: new Image()

};


images.grass.src =
    "assets/tiles/grass.png";

images.stone.src =
    "assets/tiles/stone.png";

images.coal.src =
    "assets/tiles/coal_ore.png";

images.iron.src =
    "assets/tiles/iron_ore.png";

images.gold.src =
    "assets/tiles/gold_ore.png";

images.diamond.src =
    "assets/tiles/diamond_ore.png";

images.log.src =
    "assets/tiles/log.png";

images.leaves.src =
    "assets/tiles/leaves.png";

images.player.src =
    "assets/player/player.png";


// ==========================================
// DRAW TILE
// ==========================================

function drawTile(
    tile,
    screenX,
    screenY
) {

    if (!tile) {
        return;
    }


    const image =
        images[tile];


    if (
        image &&
        image.complete &&
        image.naturalWidth > 0
    ) {

        ctx.drawImage(
            image,
            screenX,
            screenY,
            TILE_SIZE,
            TILE_SIZE
        );

    }
    else {

        ctx.fillStyle =
            getTileColor(tile);

        ctx.fillRect(
            screenX,
            screenY,
            TILE_SIZE,
            TILE_SIZE
        );

    }

}


function getTileColor(tile) {

    switch (tile) {

        case "grass":
            return "#4f9c3d";

        case "stone":
            return "#777";

        case "coal":
            return "#333";

        case "iron":
            return "#b87355";

        case "gold":
            return "#d4af37";

        case "diamond":
            return "#35d6d0";

        case "log":
            return "#754c24";

        case "leaves":
            return "#247a32";

    }


    return "#000";

}


// ==========================================
// PLAYER COLLISION
// ==========================================

function isSolidBuildTile(
    x,
    y
) {

    const tile =
        getBuildTile(
            x,
            y
        );


    return (
        tile === "log" ||
        tile === "leaves"
    );

}


function canPlayerMoveTo(
    newX,
    newY
) {

    const halfWidth =
        player.width / 2;

    const halfHeight =
        player.height / 2;


    const left =
        newX - halfWidth;

    const right =
        newX + halfWidth;

    const top =
        newY - halfHeight;

    const bottom =
        newY + halfHeight;


    const tileLeft =
        Math.floor(
            left / TILE_SIZE
        );

    const tileRight =
        Math.floor(
            right / TILE_SIZE
        );

    const tileTop =
        Math.floor(
            top / TILE_SIZE
        );

    const tileBottom =
        Math.floor(
            bottom / TILE_SIZE
        );


    for (
        let y = tileTop;
        y <= tileBottom;
        y++
    ) {

        for (
            let x = tileLeft;
            x <= tileRight;
            x++
        ) {

            if (
                isSolidBuildTile(
                    x,
                    y
                )
            ) {

                return false;

            }

        }

    }


    return true;

}


// ==========================================
// PLAYER MOVEMENT
// ==========================================

function updatePlayer(
    deltaTime
) {

    let dx = 0;
    let dy = 0;


    if (keys["w"]) {
        dy--;
    }

    if (keys["s"]) {
        dy++;
    }

    if (keys["a"]) {
        dx--;
    }

    if (keys["d"]) {
        dx++;
    }


    if (
        dx !== 0 &&
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= length;
        dy /= length;

    }


    const movement =
        player.speed *
        deltaTime;


    const newX =
        player.x +
        dx * movement;


    if (
        canPlayerMoveTo(
            newX,
            player.y
        )
    ) {

        player.x =
            newX;

    }


    const newY =
        player.y +
        dy * movement;


    if (
        canPlayerMoveTo(
            player.x,
            newY
        )
    ) {

        player.y =
            newY;

    }

}


// ==========================================
// CAMERA
// ==========================================

function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;


    camera.y =
        player.y -
        canvas.height / 2;

}


// ==========================================
// MINING
// ==========================================

let mining = {

    active: false,

    x: null,
    y: null,

    layer: null,

    progress: 0

};


// Base time = 5 seconds

const BASE_BREAK_TIME = 5;


// ==========================================
// GET MOUSE WORLD TILE
// ==========================================

function getMouseWorldTile() {

    const worldX =
        Math.floor(
            (
                mouse.x +
                camera.x
            ) / TILE_SIZE
        );


    const worldY =
        Math.floor(
            (
                mouse.y +
                camera.y
            ) / TILE_SIZE
        );


    return {
        x: worldX,
        y: worldY
    };

}


// ==========================================
// BREAK TIME
// ==========================================

function getBreakTime(blockId) {

    const block =
        BLOCKS[blockId];


    if (!block) {

        return 0;

    }


    const tool =
        getCurrentTool();


    // Tool speed directly reduces
    // the breaking time.

    return (
        BASE_BREAK_TIME *
        block.hardness /
        5 /
        tool.speed
    );

}


// ==========================================
// START MINING
// ==========================================

function updateMining(deltaTime) {

    if (
        !mouse.left ||
        inventoryOpen
    ) {

        resetMining();
        return;

    }

    const target = getMouseWorldTile();

    // Zoek de hoogste zichtbare/bestaande laag
    // vanaf de huidige spelerlaag omhoog.
    let targetLayer = null;
    let tile = null;

    for (
        let layer = 3;
        layer >= currentLayer;
        layer--
    ) {

        const found =
            getActualTile(
                target.x,
                target.y,
                layer
            );

        if (found) {

            targetLayer = layer;
            tile = found;

            break;

        }

    }

    if (!tile) {

        resetMining();
        return;

    }

    // Target veranderd
    if (
        mining.x !== target.x ||
        mining.y !== target.y ||
        mining.layer !== targetLayer
    ) {

        mining.x = target.x;
        mining.y = target.y;
        mining.layer = targetLayer;

        mining.progress = 0;
        mining.active = true;

    }

    const breakTime =
        getBreakTime(tile);

    mining.progress +=
        deltaTime /
        breakTime;

    if (
        mining.progress >= 1
    ) {

        breakBlock(
            target.x,
            target.y,
            targetLayer,
            tile
        );

        resetMining();

    }

}


function resetMining() {

    mining.active =
        false;

    mining.x =
        null;

    mining.y =
        null;

    mining.layer =
        null;

    mining.progress =
        0;

}


// ==========================================
// BREAK BLOCK
// ==========================================

function breakBlock(
    x,
    y,
    layer,
    tile
) {

    console.log(
        "Broken:",
        tile,
        x,
        y,
        "layer",
        layer
    );


    // For now build-layer blocks
    // are removed by keeping a local
    // modification map.

    setBlockOverride(
        x,
        y,
        layer,
        null
    );


    // Give drop

    const block =
        BLOCKS[tile];


    if (
        block &&
        block.drop
    ) {

        addItem(
            block.drop,
            1
        );

    }

}


// ==========================================
// WORLD OVERRIDES
// ==========================================

// Later this exact system gets sent
// to Supabase in multiplayer.

const blockOverrides =
    new Map();


function overrideKey(
    x,
    y,
    layer
) {

    return (
        `${x},${y},${layer}`
    );

}


function setBlockOverride(
    x,
    y,
    layer,
    block
) {

    blockOverrides.set(
        overrideKey(
            x,
            y,
            layer
        ),
        block
    );

}


function getBlockOverride(
    x,
    y,
    layer
) {

    const key =
        overrideKey(
            x,
            y,
            layer
        );


    if (
        blockOverrides.has(key)
    ) {

        return blockOverrides.get(
            key
        );

    }


    return undefined;

}


// ==========================================
// ORIGINAL TILE WITH OVERRIDE
// ==========================================

function getActualTile(
    x,
    y,
    layer
) {

    const override =
        getBlockOverride(
            x,
            y,
            layer
        );


    if (
        override !== undefined
    ) {

        return override;

    }


    return getTile(
        x,
        y,
        layer
    );

}


// ==========================================
// PLACE BLOCK
// ==========================================

function placeSelectedBlock() {

    const item =
        getSelectedItem();


    if (!item) {

        return;

    }


    // Tools cannot be placed

    if (
        TOOLS[item.id]
    ) {

        return;

    }


    const block =
        item.id;


    if (
        !BLOCKS[block]
    ) {

        return;

    }


    // Build layer only

    const target =
        getMouseWorldTile();


    const existing =
        getActualTile(
            target.x,
            target.y,
            3
        );


    if (existing) {

        return;

    }


    // Don't place inside player

    if (
        playerIntersectsTile(
            target.x,
            target.y
        )
    ) {

        return;

    }


    setBlockOverride(
        target.x,
        target.y,
        3,
        block
    );


    removeItem(
        inventory.selectedHotbar,
        1
    );

}


function playerIntersectsTile(
    tileX,
    tileY
) {

    const left =
        tileX * TILE_SIZE;

    const top =
        tileY * TILE_SIZE;

    const right =
        left + TILE_SIZE;

    const bottom =
        top + TILE_SIZE;


    const playerLeft =
        player.x -
        player.width / 2;

    const playerRight =
        player.x +
        player.width / 2;

    const playerTop =
        player.y -
        player.height / 2;

    const playerBottom =
        player.y +
        player.height / 2;


    return (
        playerRight > left &&
        playerLeft < right &&
        playerBottom > top &&
        playerTop < bottom
    );

}


// ==========================================
// RIGHT CLICK
// ==========================================

canvas.addEventListener(
    "click",
    event => {

        if (
            event.button === 0
        ) {

            return;

        }

    }
);


canvas.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 2 &&
            !inventoryOpen
        ) {

            placeSelectedBlock();

        }

    }
);


// ==========================================
// INVENTORY ITEMS
// ==========================================

function addItem(
    id,
    amount
) {

    // First stack existing item

    for (
        let i = 0;
        i < inventory.slots.length;
        i++
    ) {

        const slot =
            inventory.slots[i];


        if (
            slot &&
            slot.id === id
        ) {

            slot.amount +=
                amount;

            return true;

        }

    }


    // Find empty slot

    for (
        let i = 0;
        i < inventory.slots.length;
        i++
    ) {

        if (
            !inventory.slots[i]
        ) {

            inventory.slots[i] = {

                id,
                amount

            };


            return true;

        }

    }


    return false;

}


function removeItem(
    slotIndex,
    amount
) {

    const slot =
        inventory.slots[
            slotIndex
        ];


    if (!slot) {

        return false;

    }


    slot.amount -=
        amount;


    if (
        slot.amount <= 0
    ) {

        inventory.slots[
            slotIndex
        ] = null;

    }


    return true;

}


// ==========================================
// RENDER GROUND
// ==========================================

function renderGround() {

    const startX =
        Math.floor(
            camera.x / TILE_SIZE
        ) - 1;


    const startY =
        Math.floor(
            camera.y / TILE_SIZE
        ) - 1;


    const endX =
        startX +
        Math.ceil(
            canvas.width / TILE_SIZE
        ) + 3;


    const endY =
        startY +
        Math.ceil(
            canvas.height / TILE_SIZE
        ) + 3;


    for (
        let y = startY;
        y < endY;
        y++
    ) {

        for (
            let x = startX;
            x < endX;
            x++
        ) {

            const tile =
                getActualTile(
                    x,
                    y,
                    2
                );


            drawTile(
                tile,
                x * TILE_SIZE -
                    camera.x,
                y * TILE_SIZE -
                    camera.y
            );

        }

    }

}


// ==========================================
// RENDER BUILD
// ==========================================

function renderBuild() {

    const startX =
        Math.floor(
            camera.x / TILE_SIZE
        ) - 1;


    const startY =
        Math.floor(
            camera.y / TILE_SIZE
        ) - 1;


    const endX =
        startX +
        Math.ceil(
            canvas.width / TILE_SIZE
        ) + 3;


    const endY =
        startY +
        Math.ceil(
            canvas.height / TILE_SIZE
        ) + 3;


    for (
        let y = startY;
        y < endY;
        y++
    ) {

        for (
            let x = startX;
            x < endX;
            x++
        ) {

            const tile =
                getActualTile(
                    x,
                    y,
                    3
                );


            if (!tile) {
                continue;
            }


            drawTile(
                tile,
                x * TILE_SIZE -
                    camera.x,
                y * TILE_SIZE -
                    camera.y
            );

        }

    }

}


// ==========================================
// RENDER UNDERGROUND
// ==========================================

function renderUnderground() {

    const startX =
        Math.floor(
            camera.x / TILE_SIZE
        ) - 1;


    const startY =
        Math.floor(
            camera.y / TILE_SIZE
        ) - 1;


    const endX =
        startX +
        Math.ceil(
            canvas.width / TILE_SIZE
        ) + 3;


    const endY =
        startY +
        Math.ceil(
            canvas.height / TILE_SIZE
        ) + 3;


    for (
        let y = startY;
        y < endY;
        y++
    ) {

        for (
            let x = startX;
            x < endX;
            x++
        ) {

            const tile =
                getActualTile(
                    x,
                    y,
                    1
                );


            drawTile(
                tile,
                x * TILE_SIZE -
                    camera.x,
                y * TILE_SIZE -
                    camera.y
            );

        }

    }

}


// ==========================================
// PLAYER
// ==========================================

function renderPlayer() {

    const x =
        player.x -
        camera.x -
        player.width / 2;


    const y =
        player.y -
        camera.y -
        player.height / 2;


    if (
        images.player.complete &&
        images.player.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.player,
            Math.floor(x),
            Math.floor(y),
            player.width,
            player.height
        );

    }
    else {

        ctx.fillStyle =
            "#ffd83d";

        ctx.fillRect(
            x,
            y,
            player.width,
            player.height
        );

    }

}


// ==========================================
// BREAK PROGRESS
// ==========================================

function renderMiningProgress() {

    if (
        !mining.active ||
        mining.x === null
    ) {

        return;

    }


    const screenX =
        mining.x *
        TILE_SIZE -
        camera.x;


    const screenY =
        mining.y *
        TILE_SIZE -
        camera.y;


    const size =
        Math.max(
            1,
            Math.floor(
                TILE_SIZE *
                mining.progress
            )
        );


    ctx.fillStyle =
        "rgba(0, 0, 0, 0.75)";


    ctx.fillRect(
        screenX,
        screenY,
        size,
        size
    );

}


// ==========================================
// INVENTORY UI UPDATE
// ==========================================

function renderInventoryUI() {

    const slots =
        document.querySelectorAll(
            "#inventorySlots .inventorySlot"
        );


    slots.forEach(
        (element, index) => {

            element.innerHTML = "";


            const item =
                inventory.slots[index];


            if (!item) {
                return;
            }


            const image =
                createItemImage(
                    item.id
                );


            if (image) {

                element.appendChild(
                    image
                );

            }


            const amount =
                document.createElement(
                    "span"
                );


            amount.className =
                "itemAmount";


            amount.textContent =
                item.amount;


            element.appendChild(
                amount
            );

        }
    );


    renderHotbar();

}


function createItemImage(id) {

    const image =
        images[id] ||
        toolImages[id];


    if (
        image &&
        image.complete &&
        (
            image.naturalWidth > 0 ||
            image.width > 0
        )
    ) {

        const element =
            document.createElement(
                "img"
            );


        element.className =
            "itemIcon";


        element.src =
            image.src;


        return element;

    }


    return null;

}


function renderHotbar() {

    const slots =
        document.querySelectorAll(
            ".hotbarSlot"
        );


    slots.forEach(
        (element, index) => {

            element.innerHTML = "";


            const number =
                document.createElement(
                    "span"
                );


            number.className =
                "slotNumber";


            number.textContent =
                index + 1;


            element.appendChild(
                number
            );


            const item =
                inventory.slots[index];


            if (!item) {
                return;
            }


            const image =
                createItemImage(
                    item.id
                );


            if (image) {

                element.appendChild(
                    image
                );

            }


            const amount =
                document.createElement(
                    "span"
                );


            amount.className =
                "itemAmount";


            amount.textContent =
                item.amount;


            element.appendChild(
                amount
            );

        }
    );

}


// ==========================================
// CRAFTING
// ==========================================

function countItem(id) {

    let total = 0;


    for (
        const slot
        of inventory.slots
    ) {

        if (
            slot &&
            slot.id === id
        ) {

            total +=
                slot.amount;

        }

    }


    return total;

}


function canCraft(recipe) {

    for (
        const id
        in recipe.ingredients
    ) {

        if (
            countItem(id) <
            recipe.ingredients[id]
        ) {

            return false;

        }

    }


    return true;

}


function consumeItem(
    id,
    amount
) {

    for (
        let i = 0;
        i < inventory.slots.length;
        i++
    ) {

        const slot =
            inventory.slots[i];


        if (
            !slot ||
            slot.id !== id
        ) {

            continue;

        }


        const take =
            Math.min(
                amount,
                slot.amount
            );


        slot.amount -=
            take;


        amount -=
            take;


        if (
            slot.amount <= 0
        ) {

            inventory.slots[i] =
                null;

        }


        if (
            amount <= 0
        ) {

            return;

        }

    }

}


function craft(recipe) {

    if (
        !canCraft(recipe)
    ) {

        return false;

    }


    for (
        const id
        in recipe.ingredients
    ) {

        consumeItem(
            id,
            recipe.ingredients[id]
        );

    }


    addItem(
        recipe.id,
        recipe.output
    );


    renderInventoryUI();


    return true;

}


// ==========================================
// SIMPLE CRAFTING CLICK
// ==========================================

document.addEventListener(
    "dblclick",
    event => {

        if (
            !inventoryOpen
        ) {

            return;

        }


        if (
            event.target.classList.contains(
                "craftSlot"
            )
        ) {

            // voorlopig:
            // probeer recepten in volgorde

            for (
                const recipe
                of RECIPES
            ) {

                if (
                    canCraft(recipe)
                ) {

                    craft(recipe);

                    break;

                }

            }

        }

    }
);


// ==========================================
// RENDER
// ==========================================

function renderWorld() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Ondergrond altijd tekenen
    renderUnderground();


    // Grond tekenen als we op laag 2 of hoger zitten
    if (currentLayer >= 2) {

        renderGround();

    }


    // Bouwlaag tekenen als we op laag 3 zitten
    // of als de bouwlaag zichtbaar is vanaf laag 2
    if (currentLayer >= 2) {

        renderBuild();

    }


    renderMiningProgress();

    renderPlayer();

}


// ==========================================
// DEBUG
// ==========================================

const layerText =
    document.getElementById(
        "layerText"
    );


const chunkText =
    document.getElementById(
        "chunkText"
    );


const cameraText =
    document.getElementById(
        "cameraText"
    );


function updateDebug() {

    let name =
        "Ground";


    if (
        currentLayer === 1
    ) {

        name =
            "Underground";

    }


    if (
        currentLayer === 3
    ) {

        name =
            "Build";

    }


    layerText.textContent =
        name;


    const chunkX =
        Math.floor(
            player.x /
            (
                TILE_SIZE *
                CHUNK_SIZE
            )
        );


    const chunkY =
        Math.floor(
            player.y /
            (
                TILE_SIZE *
                CHUNK_SIZE
            )
        );


    chunkText.textContent =
        `${chunkX}, ${chunkY}`;


    cameraText.textContent =
        `${Math.floor(player.x)}, ${Math.floor(player.y)}`;

}


// ==========================================
// RESIZE
// ==========================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    ctx.imageSmoothingEnabled =
        false;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


// ==========================================
// GAME LOOP
// ==========================================

let lastTime = 0;


function gameLoop(time) {

    const deltaTime =
        Math.min(
            (time - lastTime) / 1000,
            0.1
        );


    lastTime =
        time;


    if (!inventoryOpen) {

        updatePlayer(
            deltaTime
        );

        updateMining(
            deltaTime
        );

    }


    updateCamera();

    renderWorld();

    updateDebug();

    renderInventoryUI();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


updateToolDebug();

console.log(
    "World + player + mining + building + inventory loaded!"
);
