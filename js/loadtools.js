console.log("Loading tools...");


const toolImages = {};


function loadTool(name, path) {

    const image = new Image();

    image.src = path;

    image.onload = () => {

        const canvas =
            document.createElement("canvas");

        canvas.width =
            image.width;

        canvas.height =
            image.height;


        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            image,
            0,
            0
        );


        const imageData =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );


        const pixels =
            imageData.data;


        for (
            let i = 0;
            i < pixels.length;
            i += 4
        ) {

            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];


            // Witte / bijna witte pixels
            // worden transparant.

            if (
                r >= 245 &&
                g >= 245 &&
                b >= 245
            ) {

                pixels[i + 3] = 0;

            }

        }


        ctx.putImageData(
            imageData,
            0,
            0
        );


        const transparentImage =
            new Image();

        transparentImage.src =
            canvas.toDataURL();


        toolImages[name] =
            transparentImage;


        console.log(
            `Tool loaded: ${name}`
        );

    };


    image.onerror = () => {

        console.warn(
            `Tool not found: ${path}`
        );

    };

}


// ==========================================
// TOOLS
// ==========================================

loadTool(
    "wooden_pickaxe",
    "assets/tools/wooden_pickaxe.png"
);

loadTool(
    "stone_pickaxe",
    "assets/tools/stone_pickaxe.png"
);

loadTool(
    "iron_pickaxe",
    "assets/tools/iron_pickaxe.png"
);

loadTool(
    "diamond_pickaxe",
    "assets/tools/diamond_pickaxe.png"
);
