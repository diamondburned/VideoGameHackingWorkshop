import { Command } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";
import * as wsbroadcast from "/src/wsbroadcast.ts";
import * as store from "/src/store.ts";
import * as level from "/src/level.ts";
import * as levels from "/src/levels/levels.ts";

export class Session {
    readonly store: store.Storer;
    readonly username: string;
    readonly broadcaster: wsbroadcast.Broadcaster;

    private currentLevel: level.Level | undefined;

    constructor(username: string, d: {
        store: store.Storer;
        broadcaster: wsbroadcast.Broadcaster;
    }) {
        this.username = username;
        this.store = d.store;
        this.broadcaster = d.broadcaster;
    }

    handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_open": {
                server.send({
                    type: "HELLO",
                    d: {
                        username: this.username,
                        levels: levels.Infos,
                    },
                });
                break;
            }
            case "_close": {
                if (this.currentLevel) {
                    this.currentLevel.destroy();
                    this.currentLevel = undefined;
                }
                break;
            }
            case "JOIN": {
                if (this.currentLevel) {
                    this.currentLevel.destroy();
                    this.currentLevel = undefined;
                }

                const newLevel = levels.Levels[cmd.d.level];
                if (!newLevel) {
                    throw `unknown level ${cmd.d.level}`;
                }

                this.currentLevel = newLevel(this);

                server.send({
                    type: "LEVEL_JOINED",
                    d: {
                        level: this.currentLevel.level,
                    },
                });
                break;
            }
        }

        if (this.currentLevel) {
            this.currentLevel.handleCommand(server, cmd);
        }
    }

    async setScore(level: number, time: number) {
        await this.store.setScore(level, {
            username: this.username,
            time: time,
        });
    }
}
