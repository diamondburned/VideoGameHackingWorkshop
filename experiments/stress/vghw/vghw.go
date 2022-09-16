package vghw

//go:generate ./generate.sh vghw.go

import (
	"encoding/json"
)

// Millisecond duration type.
type Millisecond int

// UnixMilli is the Unix timestamp in milliseconds.
type UnixMilli int

const (
	TickRate                 = 30
	TickDuration Millisecond = 1000 / TickRate
)

// Vector is used for position, velocity, acceleration. It contains an x and a y
// value.
type Vector struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// AssetID is the ID of an asset. Assets are global, meaning all maps share the
// same set of assets.
type AssetID string

// AssetPath is a path to an asset.
type AssetPath string

// Block describes a single character in a map that corresponds to the
// declared objects in its metadata.
type Block string

// BlockSize is the size of one block in pixels. One unit of Position in either
// axis will equal to one block, which should be 32 pixels. The pixels do not
// have to correspond to physical pixels, but all textures should be mapped to
// be about 1:1 and treated as a 32x32 texture.
const BlockSize = 32

// BlockPosition forms all the possible positions of a block within itself.
//
// To demonstrate its purposes, here's how it works. Suppose we have the
// following map:
//
//    LLLLLLLL
//    LLLLLLLL
//    LLLLLLLL
//
// We can deduce from this object that some of these blocks are outside, meaning
// their neighbors are not the same block, while the other blocks all have their
// neighbors be the same block. By checking what the neighbor blocks are and in
// what direction, we can deduce the positions of these blocks.
//
// Once we have the position of these blocks, we can map them to different kinds
// of textures (see BlockTextures). This allows designers to naturally design
// maps without necessarily having to design tileable edge textures or have
// different block characters for the same object.
//
// As a side note, if the edge of the block is the map boundary, then it can be
// considered that the block is extending beyond that. For example, if we have
// an L block touching the left boundary, then it is counted as a Middle block,
// not a Left block.
//
// A block with no neighbor is considered floating.
//
// Below is a diagram to help visualize these positions:
//
//                 +----------+
//                 | Floating |
//                 +----------+
//
//   +---------------------------------------+
//   | Top|Left        Top         Top|Right |
//   |                                       |
//   | Left           Middle           Right |
//   |                                       |
//   | Bottom|Left    Bottom    Bottom|Right |
//   +---------------------------------------+
//
type BlockPosition uint

const (
	FloatingBlock BlockPosition = 0

	TopBlock BlockPosition = 1 << (iota - 1)
	BottomBlock
	LeftBlock
	RightBlock

	MiddleBlock = TopBlock | BottomBlock | LeftBlock | RightBlock

	TopLeftBlock     = TopBlock | LeftBlock
	TopRightBlock    = TopBlock | RightBlock
	BottomLeftBlock  = BottomBlock | LeftBlock
	BottomRightBlock = BottomBlock | RightBlock
)

// BlockType is an enum that describes a block type, which is determined by
// whether the object ID is under metadata.blocks or metadata.entities.
type BlockType uint

const (
	TypeBlock BlockType = iota
	TypeEntity
)

// BlockModifier is any modifier that a block can have within a map.
//
// Possible options
//
// air lets the player pass through the block. Block " " automatically have this
// modifier.
//
// goal turns all regions of the block into one goal. Use this in combination
// with air or the player won't be able to hit the goal.
//
// fixed forces the renderer to render this object at a fixed position by
// stretching the texture into the regions covered by 32x32 blocks.
type BlockModifier string // "air" | "goal" | "fixed"

// RawMap is the entire map described as an array of map lines. The length of
// this array is guaranteed to be equal to the height in the metadata.
type RawMap string

// MapMetadata is the metadata of a map.
type MapMetadata struct {
	Blocks      map[Block]BlockTextures `json:"blocks"`
	Entities    map[Block]AssetID       `json:"entities"`
	BlockMods   map[Block]BlockModifier `json:"blockMods"`
	Attributes  map[string]any          `json:"attributes"`
	Backgrounds []MapBackground         `json:"backgrounds"`
}

// BlockTextures is the structure that contains either a single AssetID for all
// block positions or a map of Positions.
type BlockTextures struct {
	All       AssetID
	Positions map[BlockPosition]AssetID
}

// UnmarshalJSON unmarshals a string | BlockTextures type from JSON.
func (t *BlockTextures) UnmarshalJSON(b []byte) error {
	var asset AssetID
	if err := json.Unmarshal(b, &asset); err == nil {
		*t = BlockTextures{All: asset}
		return nil
	}

	t.All = ""
	return json.Unmarshal(b, &t.Positions)
}

// MapBackground describes a map's background layer.
type MapBackground struct {
	Asset AssetID           `json:"asset"`
	Mode  MapBackgroundMode `json:"mode"`
}

// MapBackgroundMode describes how the background should be rendered.
type MapBackgroundMode string

const (
	BackgroundTiledMode     MapBackgroundMode = "tiled"
	BackgroundFixedMode     MapBackgroundMode = "fixed"
	BackgroundStretchedMode MapBackgroundMode = "stretched"
)

// Event is the event union received from the WS.
type Event interface {
	json.Marshaler
	EventType() string
}

// HelloEvent is the HELLO event data.
type HelloEvent struct {
	Username string      `json:"username"`
	Levels   []LevelInfo `json:"levels"`
}

// WarningEvent is the WARNING event data.
type WarningEvent struct {
	Message string `json:"message"`
}

// LevelJoinedEvent is the LEVEL_JOINED event data.
type LevelJoinedEvent struct {
	Level int       `json:"level"`
	Info  LevelInfo `json:"info"`
	Raw   RawMap    `json:"raw"`
}

// LevelInfo is the info for each level.
type LevelInfo struct {
	Number int    `json:"number"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
}

// LevelFinishedEvent is the LEVEL_FINISHED event data.
type LevelFinishedEvent struct {
	Level int         `json:"level"`
	Won   bool        `json:"won"`
	Time  Millisecond `json:"time"`
}

// PersonalScoreEvent is the PERSONAL_SCORE event data.
type PersonalScoreEvent []PersonalScore

// PersonalScore is a score entry for the current user. It keeps track of the
// best time for a level.
type PersonalScore struct {
	Level      int         `json:"level"`
	YourBest   Millisecond `json:"yourBest"`
	GlobalBest Millisecond `json:"globalBest"`
}

// LeaderboardUpdateEvent is the LEADERBOARD_UPDATE event data.
//
// It is emitted throughout the Websocket session when a new player has obtained
// a new high score. The client is expected to replace the score of whatever is
// present in the Leaderboards.
type LeaderboardUpdateEvent Leaderboards

// Leaderboards describes a leaderboard type. It contains the leaderboards of
// all players.
type Leaderboards []LevelLeaderboard

// LevelLeaderboard is the leaderboard of a single level.
type LevelLeaderboard struct {
	Level  int          `json:"level"`
	Scores []LevelScore `json:"scores"`
}

// LevelScore is a single high score entry inside a leaderboard.
type LevelScore struct {
	Username string      `json:"username"`
	BestTime Millisecond `json:"bestTime"`
}

// EntityMoveEvent is the ENTITY_MOVE event data.
//
// It is an event that's sent by the server on potentially every tick. The
// server may or may not send the event if there's nothing to be updated.
//
// The client is advised to linear-interpolate (lerp) the entities when it
// receives the event. This prevents entities from jittering on the screen.
type EntityMoveEvent struct {
	Level    int                  `json:"level"`
	Entities []EntityPositionData `json:"entities"`
}

// EntityPositionData describes a position of an entity. The entity is
// identified by its initial position on the map.
type EntityPositionData struct {
	// InitialPosition is the entity's initial position on the map. Refer to
	// map.Map's methods for additional helpers.
	InitialPosition Vector `json:"initialPosition"`
	// Position is the new position of the entity.
	Position Vector `json:"position"`
}

// Command is the command union received from the WS.
type Command interface {
	json.Marshaler
	CommandType() string
}

// JoinCommand is the JOIN command data.
//
// It requests to the server that the client is joining a new map.
type JoinCommand struct {
	Level int `json:"level"`
}

// MoveCommand is the MOVE command data.
//
// It is the command to be sent on every player movement. The client should send
// this command as often as it needs to, which could be on every movement or
// every duration (such as 16.67ms or 60Hz). However, the server may not process
// the movement until it ticks, which is every TickDuration defined above.
//
// It is also worth noting that the client can ONLY directly control the
// player's movement, and that will be the only entity that it can directly
// control. Other entities are controlled by the server and will be calculated
// appropriately. As such, there's no need for this command to describe movement
// of any other entity than the player.
type MoveCommand struct {
	Position Vector `json:"position"`
}
