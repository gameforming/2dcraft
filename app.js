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

// 32 × 32 tiles per chunk
const CHUNK_SIZE = 32;

// World seed
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

// 1 = Underground
// 2 = Ground
// 3 = Build

let currentLayer = 2;


// ==========================================
// INPUT
// ==========================================

const keys = {};

window.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;


    // Layer switching

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

// Creates deterministic random numbers.
// Same coordinates + same seed = same world.

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
// GET TILE
// ==========================================

function getTile(worldX, worldY, layer) {


    // --------------------------
    // UNDERGROUND
    // --------------------------

    if (layer === 1) {

        const random = seededRandom(
            worldX,
            worldY,
            1
        );


        // Extremely rare diamond
        if (random < 0.001) {

            return "diamond";

        }


        // Rare gold
        if (random < 0.005) {

            return "gold";

        }


        // Iron
        if (random < 0.02) {

            return "iron";

        }


        // Coal
        if (random < 0.06) {

            return "coal";

        }


        return "stone";

    }


    // --------------------------
    // GROUND
    // --------------------------

    if (layer === 2) {

        return "grass";

    }


    // --------------------------
    // BUILD LAYER
    // --------------------------

    if (layer === 3) {

        return null;

    }


    return null;

}


// ==========================================
// TILE COLORS
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

    }


    return null;

}


// ==========================================
// DRAW TILE
// ==========================================

function drawTile(tile, screenX, screenY) {

    if (!tile) {
        return;
    }


    const color = getTileColor(tile);

    if (!color) {
        return;
    }


    ctx.fillStyle = color;

    ctx.fillRect(
        screenX,
        screenY,
        TILE_SIZE,
        TILE_SIZE
    );


    // Simple grid border

    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";

    ctx.strokeRect(
        screenX,
        screenY,
        TILE_SIZE,
        TILE_SIZE
    );

}


// ==========================================
// RENDER WORLD
// ==========================================

function renderWorld() {


    // Amount of visible tiles

    const startTileX =
        Math.floor(camera.x / TILE_SIZE);

    const startTileY =
        Math.floor(camera.y / TILE_SIZE);


    const endTileX =
        startTileX +
        Math.ceil(canvas.width / TILE_SIZE) +
        2;


    const endTileY =
        startTileY +
        Math.ceil(canvas.height / TILE_SIZE) +
        2;


    // Draw visible tiles only

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


            const tile = getTile(
                worldX,
                worldY,
                currentLayer
            );


            const screenX =
                worldX * TILE_SIZE -
                camera.x;


            const screenY =
                worldY * TILE_SIZE -
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
        camera.speed * deltaTime;


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
// RESIZE CANVAS
// ==========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
    document.getElementById("layerText");

const chunkText =
    document.getElementById("chunkText");

const cameraText =
    document.getElementById("cameraText");


function updateDebug() {


    let layerName = "Ground";


    if (currentLayer === 1) {
        layerName = "Underground";
    }

    if (currentLayer === 3) {
        layerName = "Build";
    }


    layerText.textContent =
        layerName;


    const centerX =
        camera.x + canvas.width / 2;


    const centerY =
        camera.y + canvas.height / 2;


    const chunkX =
        Math.floor(
            centerX /
            (TILE_SIZE * CHUNK_SIZE)
        );


    const chunkY =
        Math.floor(
            centerY /
            (TILE_SIZE * CHUNK_SIZE)
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
            (time - lastTime) / 1000,
            0.1
        );


    lastTime = time;


    // Clear screen

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Update

    update(deltaTime);


    // Render world

    renderWorld();


    // Update UI

    updateDebug();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


console.log(
    "2D World loaded successfully!"
);
