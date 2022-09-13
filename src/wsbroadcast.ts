import { Event } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";

export class Registry {
    private servers: ws.Server[] = [];

    constructor() {}

    register(s: ws.Server): Broadcaster {
        this.servers.push(s);
        return new Broadcaster(this, s);
    }

    async broadcast(current: ws.Server, ev: Event) {
        const promises = [];
        promises.length = this.servers.length - 1;

        for (const server of this.servers) {
            if (server == current) {
                continue;
            }

            const promise = new Promise((done) => {
                server.send(ev);
                done(undefined);
            });

            promises.push(promise);
        }

        await Promise.all(promises);
    }
}

export class Broadcaster {
    constructor(readonly registry: Registry, readonly s: ws.Server) {}

    broadcast(ev: Event) {
        this.registry.broadcast(this.s, ev);
    }
}
