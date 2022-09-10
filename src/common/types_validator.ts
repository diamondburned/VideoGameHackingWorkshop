// Code generated by generate_validator.js. DO NOT EDIT.
//
// deno-lint-ignore-file
import * as t from "./types.ts";

// ValidationError is thrown on every error returned by ValidateX
// functions.
export class ValidationError extends Error {}

// ValidatePosition validates the needed type constraints
// from v and cast it to Position.
export function ValidatePosition(v: any): t.Position {
    if (typeof v.x !== "number") throw new ValidationError("missing v.x");
    if (typeof v.y !== "number") throw new ValidationError("missing v.y");

    return v as t.Position;
}

// ValidateVelocity validates the needed type constraints
// from v and cast it to Velocity.
export function ValidateVelocity(v: any): t.Velocity {
    if (typeof v.x !== "number") throw new ValidationError("missing v.x");
    if (typeof v.y !== "number") throw new ValidationError("missing v.y");

    return v as t.Velocity;
}

// ValidateScore validates the needed type constraints
// from v and cast it to Score.
export function ValidateScore(v: any): t.Score {
    if (typeof v.username !== "string") throw new ValidationError("missing v.username");
    if (v.time === undefined) throw new ValidationError("missing v.time");

    return v as t.Score;
}

// ValidateEvent validates the needed type constraints
// from v and cast it to Event.
export function ValidateEvent(v: any): t.Event {
    switch (v.type) {
        case "HELLO": {
            ValidateHelloEvent(v);
            break;
        }
        case "WARNING": {
            ValidateWarningEvent(v);
            break;
        }
        case "MAP_DATA": {
            ValidateMapDataEvent(v);
            break;
        }
        case "VICTORY": {
            ValidateVictoryEvent(v);
            break;
        }
        case "ENTITY_MOVE": {
            ValidateEntityMoveEvent(v);
            break;
        }
        case undefined: {
            throw new ValidationError("missing v.type");
        }
        default: {
            throw new ValidationError("unknown v.type given");
        }
    }

    return v as t.Event;
}

// ValidateHelloEvent validates the needed type constraints
// from v and cast it to HelloEvent.
export function ValidateHelloEvent(v: any): t.HelloEvent {
    if (v.type !== "HELLO") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.nLevels !== "number") throw new ValidationError("missing v.d.nLevels");
    if (typeof v.d.completedLevels !== "object") throw new ValidationError("missing v.d.completedLevels");

    return v as t.HelloEvent;
}

// ValidateWarningEvent validates the needed type constraints
// from v and cast it to WarningEvent.
export function ValidateWarningEvent(v: any): t.WarningEvent {
    if (v.type !== "WARNING") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.message !== "string") throw new ValidationError("missing v.d.message");

    return v as t.WarningEvent;
}

// ValidateMapDataEvent validates the needed type constraints
// from v and cast it to MapDataEvent.
export function ValidateMapDataEvent(v: any): t.MapDataEvent {
    if (v.type !== "MAP_DATA") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (v.d.map === undefined) throw new ValidationError("missing v.d.map");
    if (v.d.metadata === undefined) throw new ValidationError("missing v.d.metadata");

    return v as t.MapDataEvent;
}

// ValidateVictoryEvent validates the needed type constraints
// from v and cast it to VictoryEvent.
export function ValidateVictoryEvent(v: any): t.VictoryEvent {
    if (v.type !== "VICTORY") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (v.d.time === undefined) throw new ValidationError("missing v.d.time");

    return v as t.VictoryEvent;
}

// ValidateEntityPositionData validates the needed type constraints
// from v and cast it to EntityPositionData.
export function ValidateEntityPositionData(v: any): t.EntityPositionData {
    if (v.initial === undefined) throw new ValidationError("missing v.initial");
    ValidatePosition(v.initial);
    if (v.position === undefined) throw new ValidationError("missing v.position");
    ValidatePosition(v.position);

    return v as t.EntityPositionData;
}

// ValidateEntityMoveEvent validates the needed type constraints
// from v and cast it to EntityMoveEvent.
export function ValidateEntityMoveEvent(v: any): t.EntityMoveEvent {
    if (v.type !== "ENTITY_MOVE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (typeof v.d.entities !== "object") throw new ValidationError("missing v.d.entities");

    return v as t.EntityMoveEvent;
}

// ValidateCommand validates the needed type constraints
// from v and cast it to Command.
export function ValidateCommand(v: any): t.Command {
    switch (v.type) {
        case "JOIN": {
            ValidateJoinCommand(v);
            break;
        }
        case "MOVE": {
            ValidateMoveCommand(v);
            break;
        }
        case undefined: {
            throw new ValidationError("missing v.type");
        }
        default: {
            throw new ValidationError("unknown v.type given");
        }
    }

    return v as t.Command;
}

// ValidateJoinCommand validates the needed type constraints
// from v and cast it to JoinCommand.
export function ValidateJoinCommand(v: any): t.JoinCommand {
    if (v.type !== "JOIN") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");

    return v as t.JoinCommand;
}

// ValidateMoveCommand validates the needed type constraints
// from v and cast it to MoveCommand.
export function ValidateMoveCommand(v: any): t.MoveCommand {
    if (v.type !== "MOVE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (v.d.position === undefined) throw new ValidationError("missing v.d.position");
    ValidatePosition(v.d.position);

    return v as t.MoveCommand;
}
