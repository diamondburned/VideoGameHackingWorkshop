package main

import (
	"context"
	"encoding/json"
	"net"

	"github.com/AaronLieb/VideoGameHackingWorkshop/experiments/stress/vghw"
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
)

type dialer func(context.Context) (*websocket.Conn, error)

// conn takes over a websocket.Conn and provides an event loop listener.
type conn struct {
	*websocket.Conn
}

func newConn(wsConn *websocket.Conn) *conn {
	return &conn{wsConn}
}

// Send sends a Websocket command.
func (c *conn) Send(ctx context.Context, cmd vghw.Command) error {
	b, err := json.Marshal(cmd)
	if err != nil {
		return errors.Wrap(err, "cannot marshal cmd")
	}

	return c.WriteMessage(websocket.TextMessage, b)
}

// Listen starts spinning on the Websocket connection. The connection is closed
// if the given ctx is cancelled.
func (c *conn) Listen(ctx context.Context, evCh chan<- vghw.Event) error {
	defer c.Close()

	go func() {
		<-ctx.Done()
		c.Close()
	}()

	for {
		_, pl, err := c.ReadMessage()
		if err != nil {
			if errors.Is(err, net.ErrClosed) {
				return nil
			}
			return err
		}

		ev, err := vghw.UnmarshalEvent(pl)
		if err != nil {
			return errors.Wrap(err, "cannot unmarshal event")
		}

		select {
		case evCh <- ev:
			// ok
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}
