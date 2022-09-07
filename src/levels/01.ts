import { BlockPosition, MapMetadata } from "/src/common/types.ts";
import * as level from "/src/level.ts";
import * as map from "/src/common/map.ts";

const rawMap = `
                                  LLLL
                                LLLLLLLL
                                LLLLLLLLL
                                  LLLLL
                                   WW                       g
                                   WW                       g
        P                          WW                       G
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`;

const metadata: MapMetadata = {
    blocks: {
        "L": {
            [BlockPosition.Floating]: "leafm",
            [BlockPosition.Top]: "leaft",
            [BlockPosition.TopLeft]: "leaftl",
            [BlockPosition.TopRight]: "leaftr",
            [BlockPosition.Middle]: "leafm",
            [BlockPosition.Left]: "leafl",
            [BlockPosition.Right]: "leafr",
            [BlockPosition.Bottom]: "leafb",
            [BlockPosition.BottomLeft]: "leafbl",
            [BlockPosition.BottomRight]: "leafbr",
        },
        "W": {
            [BlockPosition.Floating]: "woodl",
            [BlockPosition.Top]: "woodl",
            [BlockPosition.TopLeft]: "woodl",
            [BlockPosition.TopRight]: "woodr",
            [BlockPosition.Middle]: "woodl",
            [BlockPosition.Left]: "woodl",
            [BlockPosition.Right]: "woodr",
            [BlockPosition.Bottom]: "woodl",
            [BlockPosition.BottomLeft]: "woodl",
            [BlockPosition.BottomRight]: "woodr",
        },
        "^": {
            [BlockPosition.Floating]: "grassf",
            [BlockPosition.Top]: "grass",
            [BlockPosition.TopLeft]: "grassl",
            [BlockPosition.TopRight]: "glassr",
            [BlockPosition.Middle]: "dirt",
            [BlockPosition.Left]: "dirtl",
            [BlockPosition.Right]: "dirtr",
            [BlockPosition.Bottom]: "dirtb",
            [BlockPosition.BottomLeft]: "dirtbl",
            [BlockPosition.BottomRight]: "dirtbr",
        },
        "G": "star",
        "g": "",
    },
    entities: {
        "P": "player[1-4]", // handle this in the engine
    },
    blockMods: {
        "G": ["air", "goal", "fixed"],
        "g": ["air", "goal"],
    },
    attributes: {
        n_jumps: 3,
    },
};

const levelMap = new map.Map(rawMap, metadata);

export class Level extends level.Level {
    constructor(s: level.Session) {
        super(s, levelMap, 1);
    }
}
