console.log("Starting 2D World...");

// ==========================================
// CANVAS
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


// ==========================================
// SETTINGS
// ==========================================

const TILE_SIZE = 32;
const CHUNK_SIZE = 32;

const WORLD_SEED = 123456;


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

function worldHash(x, y, extra = 0) {

    const value =
        x * 73856093 ^
        y * 19349663 ^
        WORLD_SEED * 83492791 ^
        extra * 2654435761;

    return Math.abs(value);
}


// ==========================================
// TREE CENTER
// ==========================================

function isTreeCenter(x, y) {

    const random =
        seededRandom(x, y, 50);

    return random < 0.008;
}


// ==========================================
// BUILD LAYER
// ==========================================

function getBuildTile(worldX, worldY) {

    // --------------------------------------
    // TREE LOG
    // --------------------------------------

    if (isTreeCenter(worldX, worldY)) {
        return "log";
    }


    // --------------------------------------
    // TREE LEAVES
    // --------------------------------------

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
// ORES
// ==========================================

function getOreAt(worldX, worldY) {

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


            if (random < 0.0004) {

                oreType = "diamond";

            }
            else if (random < 0.0015) {

                oreType = "gold";

            }
            else if (random < 0.006) {

                oreType = "iron";

            }
            else if (random < 0.02) {

                oreType = "coal";

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


            // 2x2

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


            // Horizontal 4

            if (pattern === 1) {

                if (
                    worldY === centerY &&
                    worldX >= centerX &&
                    worldX <= centerX + 3
                ) {

                    return oreType;

                }

            }


            // Vertical 4

            if (pattern === 2) {

                if (
                    worldX === centerX &&
                    worldY >= centerY &&
                    worldY <= centerY + 3
                ) {

                    return oreType;

                }

            }


            // Diagonal 4

            if (pattern === 3) {

                const positions = [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [2, 1]
                ];


                for (
                    const position of positions
                ) {

                    if (
                        worldX ===
                        centerX + position[0] &&

                        worldY ===
                        centerY + position[1]
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

    // Underground

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


    // Ground

    if (layer === 2) {

        return "grass";
    }


    // Build

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

    return "#000";
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


// ==========================================
// COLLISION TILE
// ==========================================

function isSolidBuildTile(
    worldX,
    worldY
) {

    const tile =
        getBuildTile(
            worldX,
            worldY
        );

    return (
        tile === "log" ||
        tile === "leaves"
    );
}


// ==========================================
// PLAYER COLLISION
// ==========================================

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
// MOVE PLAYER
// ==========================================

function updatePlayer(deltaTime) {

    let dx = 0;
    let dy = 0;


    if (keys["w"]) {
        dy -= 1;
    }

    if (keys["s"]) {
        dy += 1;
    }

    if (keys["a"]) {
        dx -= 1;
    }

    if (keys["d"]) {
        dx += 1;
    }


    // Normalize diagonal movement

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


    // X movement

    const newX =
        player.x +
        dx * movement;


    if (
        canPlayerMoveTo(
            newX,
            player.y
        )
    ) {

        player.x = newX;

    }


    // Y movement

    const newY =
        player.y +
        dy * movement;


    if (
        canPlayerMoveTo(
            player.x,
            newY
        )
    ) {

        player.y = newY;

    }

}


// ==========================================
// UPDATE CAMERA
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
// RENDER GROUND
// ==========================================

function renderGround() {

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
                    2
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
// RENDER BUILD LAYER
// ==========================================

function renderBuildLayer() {

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
                getBuildTile(
                    worldX,
                    worldY
                );


            if (!tile) {
                continue;
            }


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
// RENDER UNDERGROUND
// ==========================================

function renderUnderground() {

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
                    1
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
// RENDER PLAYER
// ==========================================

function renderPlayer() {

    const screenX =
        player.x -
        camera.x -
        player.width / 2;


    const screenY =
        player.y -
        camera.y -
        player.height / 2;


    if (
        images.player.complete &&
        images.player.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.player,
            Math.floor(screenX),
            Math.floor(screenY),
            player.width,
            player.height
        );

    }
    else {

        // Tijdelijke smiley fallback

        ctx.fillStyle = "#ffd83d";

        ctx.fillRect(
            screenX,
            screenY,
            player.width,
            player.height
        );


        ctx.fillStyle = "#111";

        ctx.fillRect(
            screenX + 7,
            screenY + 7,
            3,
            3
        );

        ctx.fillRect(
            screenX + 18,
            screenY + 7,
            3,
            3
        );

    }

}


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


    if (currentLayer === 1) {

        renderUnderground();

    }
    else {

        renderGround();

        // Build layer ligt bovenop ground

        renderBuildLayer();

    }


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

    let layerName = "Ground";


    if (currentLayer === 1) {
        layerName = "Underground";
    }

    if (currentLayer === 3) {
        layerName = "Build";
    }


    layerText.textContent =
        layerName;


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

    ctx.imageSmoothingEnabled = false;

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


    lastTime = time;


    updatePlayer(
        deltaTime
    );


    updateCamera();


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
    "World + player loaded successfully!"
);
