import { Entity } from "/public/js/common/entity.js";
import { app } from "/public/js/render.js";

export class SpriteEntity extends Entity {
    constructor(block, initialPos, sprite) {
        super(block, initialPos);
        this.sprite = sprite;
        Object.defineProperty(this.sprite, "x", {
            get() {
                return this.position.x;
            },
        });
        Object.defineProperty(this.sprite, "y", {
            get() {
                return this.position.y;
            },
        });
        app.stage.addChild(this.sprite);
    }
}
