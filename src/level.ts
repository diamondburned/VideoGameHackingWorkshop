import { Block, Command, Position, TickDuration } from "/src/common/types.ts";
import * as entity from "/src/common/entity.ts";
import * as map from "/src/common/map.ts";
import * as ws from "/src/ws.ts";

export interface Session {
    setScore(level: number, time: number): Promise<void>;
}

// Level describes a level with all its server logic.
export abstract class Level {
    static number: number;
    static level_name: string | undefined;
    static level_desc: string | undefined;

    abstract readonly session: Session;
    abstract readonly map: map.LevelMap;

    readonly startsAt: number;

    entities = new Map<Position, entity.Entity>();

    private wonAt: number | undefined;
    private tickID: number | undefined;

    constructor() {
        this.startsAt = Date.now();
        this.tickID = setInterval(this.tick, TickDuration);
    }

    destroy() {
        if (this.tickID) {
            clearInterval(this.tickID);
            this.tickID = undefined;
        }
    }

    // initializeEntity initializes all entities with the given block. newFn is
    // called as the entity constructor for each entity.
    protected initializeEntity(block: Block, newFn: (pos: Position) => entity.Entity) {
        this.map.iterateEntity(block, (pos: Position) => {
            this.entities.set(pos, newFn(pos));
        });
    }

    protected handleCommand(_server: ws.Server, _cmd: Command) {}
    protected tick() {}
}
