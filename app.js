console.log("Starting 2D World...");


// ==========================================
// CANVAS
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ==========================================
// SETTINGS
// ==========================================

const TILE_SIZE = 32;
const CHUNK_SIZE = 32;

const WORLD_SEED = 123456;


// ==========================================
// CAMERA
// ==========================================

const camera = {
    x: 0,
    y: 0,
    speed: 500
};


// ==========================================
// ACTIVE LAYER
// ==========================================

let currentLayer = 2;


// ==========================================
// INPUT
// ==========================================

const keys = {};

window.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    keys[key] = true;


    if (event.key === "1") {
        currentLayer = 1;
    }

    if (event.key === "2") {
        currentLayer = 2;
    }

    if (event.key === "3") {
        currentLayer = 3;
    }

});


window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


// ==========================================
// SEEDED RANDOM
// ==========================================

function seededRandom(x, y, extra = 0) {

    let value =
        x * 374761393 +
        y * 668265263 +
        WORLD_SEED * 982451653 +
        extra * 12345;

    value = Math.sin(value) * 43758.5453;

    return value - Math.floor(value);

}


// ==========================================
// WORLD HASH
// ==========================================

// Geeft een vaste unieke waarde voor een positie.
// Zelfde positie + zelfde seed = altijd hetzelfde.

function worldHash(x, y, extra = 0) {

    const value =
        x * 73856093 ^
        y * 19349663 ^
        WORLD_SEED * 83492791 ^
        extra * 2654435761;

    return Math.abs(value);

}


// ==========================================
// TREE GENERATION
// ==========================================

function isTreeCenter(x, y) {

    const random = seededRandom(x, y, 50);

    // Kans op een boom
    return random < 0.008;

}


// ==========================================
// GET BUILD TILE
// ==========================================

function getBuildTile(worldX, worldY) {


    // --------------------------------------
    // CHECK EIGEN POSITIE
    // --------------------------------------

    // Als hier een boomcentrum is,
    // staat hier de log.

    if (isTreeCenter(worldX, worldY)) {

        return "log";

    }


    // --------------------------------------
    // CHECK NABURIGE POSITIES
    // --------------------------------------

    // Een boom heeft 1 log in het midden
    // en leaves rondom de log.

    for (let offsetY = -1; offsetY <= 1; offsetY++) {

        for (let offsetX = -1; offsetX <= 1; offsetX++) {


            // Midden overslaan
            if (
                offsetX === 0 &&
                offsetY === 0
            ) {
                continue;
            }


            const treeX =
                worldX - offsetX;

            const treeY =
                worldY - offsetY;


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
// ORE GENERATION
// ==========================================

// Een ore groep heeft maximaal 4 blocks.

function getOreAt(worldX, worldY) {


    // We kijken naar mogelijke
    // ore-cluster centers in de buurt.

    for (
        let centerY = worldY - 2;
        centerY <= worldY + 2;
        centerY++
    ) {

        for (
            let centerX = worldX - 2;
            centerX <= worldX + 2;
            centerX++
        ) {


            const random =
                seededRandom(
                    centerX,
                    centerY,
                    100
                );


            let oreType = null;


            // --------------------------
            // DIAMOND
            // --------------------------

            if (random < 0.0004) {

                oreType = "diamond";

            }


            // --------------------------
            // GOLD
            // --------------------------

            else if (random < 0.0015) {

                oreType = "gold";

            }


            // --------------------------
            // IRON
            // --------------------------

            else if (random < 0.006) {

                oreType = "iron";

            }


            // --------------------------
            // COAL
            // --------------------------

            else if (random < 0.02) {

                oreType = "coal";

            }


            if (!oreType) {
                continue;
            }


            // De exacte vorm van de groep
            // wordt ook bepaald door de seed.

            const pattern =
                worldHash(
                    centerX,
                    centerY,
                    200
                ) % 4;


            // PATTERN 0
            //
            // X X
            // X X

            if (pattern === 0) {

                if (
                    worldX >= centerX &&
                    worldX <= centerX + 1 &&
                    worldY >= centerY &&
                    worldY <= centerY + 1
                ) {

                    return oreType;

                }

            }


            // PATTERN 1
            //
            // X X X X

            if (pattern === 1) {

                if (
                    worldY === centerY &&
                    worldX >= centerX &&
                    worldX <= centerX + 3
                ) {

                    return oreType;

                }

            }


            // PATTERN 2
            //
            // X
            // X
            // X
            // X

            if (pattern === 2) {

                if (
                    worldX === centerX &&
                    worldY >= centerY &&
                    worldY <= centerY + 3
                ) {

                    return oreType;

                }

            }


            // PATTERN 3
            //
            // X X
            //   X X

            if (pattern === 3) {

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
                        position[0]

                        &&

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
// GET TILE
// ==========================================

function getTile(
    worldX,
    worldY,
    layer
) {


    // ======================================
    // UNDERGROUND
    // ======================================

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


    // ======================================
    // GROUND
    // ======================================

    if (layer === 2) {

        return "grass";

    }


    // ======================================
    // BUILD LAYER
    // ======================================

    if (layer === 3) {

        return getBuildTile(
            worldX,
            worldY
        );

    }


    return null;

}


// ==========================================
// IMAGE LOADING
// ==========================================

const images = {

    grass: new Image(),
    stone: new Image(),

    coal: new Image(),
    iron: new Image(),
    gold: new Image(),
    diamond: new Image(),

    log: new Image(),
    leaves: new Image()

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


// ==========================================
// FALLBACK COLORS
// ==========================================

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

}


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


    // Als het plaatje geladen is:
    // gebruik het.

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


    // Anders gebruiken we tijdelijk kleur.

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


// ==========================================
// RENDER WORLD
// ==========================================

function renderWorld() {


    const startTileX =
        Math.floor(
            camera.x / TILE_SIZE
        ) - 1;


    const startTileY =
        Math.floor(
            camera.y / TILE_SIZE
        ) - 1;


    const endTileX =
        startTileX +
        Math.ceil(
            canvas.width / TILE_SIZE
        ) +
        3;


    const endTileY =
        startTileY +
        Math.ceil(
            canvas.height / TILE_SIZE
        ) +
        3;


    for (
        let worldY = startTileY;
        worldY < endTileY;
        worldY++
    ) {

        for (
            let worldX = startTileX;
            worldX < endTileX;
            worldX++
        ) {


            const tile =
                getTile(
                    worldX,
                    worldY,
                    currentLayer
                );


            const screenX =
                worldX *
                TILE_SIZE -
                camera.x;


            const screenY =
                worldY *
                TILE_SIZE -
                camera.y;


            drawTile(
                tile,
                Math.floor(screenX),
                Math.floor(screenY)
            );

        }

    }

}


// ==========================================
// UPDATE CAMERA
// ==========================================

function update(deltaTime) {

    const movement =
        camera.speed *
        deltaTime;


    if (keys["w"]) {

        camera.y -= movement;

    }


    if (keys["s"]) {

        camera.y += movement;

    }


    if (keys["a"]) {

        camera.x -= movement;

    }


    if (keys["d"]) {

        camera.x += movement;

    }

}


// ==========================================
// RESIZE
// ==========================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


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


    let layerName =
        "Ground";


    if (
        currentLayer === 1
    ) {

        layerName =
            "Underground";

    }


    if (
        currentLayer === 3
    ) {

        layerName =
            "Build";

    }


    layerText.textContent =
        layerName;


    const centerX =
        camera.x +
        canvas.width / 2;


    const centerY =
        camera.y +
        canvas.height / 2;


    const chunkX =
        Math.floor(
            centerX /
            (
                TILE_SIZE *
                CHUNK_SIZE
            )
        );


    const chunkY =
        Math.floor(
            centerY /
            (
                TILE_SIZE *
                CHUNK_SIZE
            )
        );


    chunkText.textContent =
        `${chunkX}, ${chunkY}`;


    cameraText.textContent =
        `${Math.floor(camera.x)}, ${Math.floor(camera.y)}`;

}


// ==========================================
// GAME LOOP
// ==========================================

let lastTime = 0;


function gameLoop(time) {


    const deltaTime =
        Math.min(
            (time - lastTime) /
            1000,
            0.1
        );


    lastTime =
        time;


    ctx.fillStyle =
        "#000";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    update(
        deltaTime
    );


    renderWorld();


    updateDebug();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


console.log(
    "World loaded!"
);
