package main

import (
	"context"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	var wsDialer websocket.Dialer
	dial := func(ctx context.Context) (*websocket.Conn, error) {
		ws, _, err := wsDialer.DialContext(ctx, "ws://localhost:8080/api/ws", http.Header{
			"Cookie": {"VGHW-Username=floodie"},
		})
		return ws, err
	}

	reportCh := make(chan stressReport)
	errorCh := make(chan error)

	// test targets
	concurrencies := []int{10, 50, 100, 200}

	doneCh := make(chan struct{})
	go func() {
		defer close(doneCh)

		for _, concurrency := range concurrencies {
			opts := stressOpts{
				level:       1,
				duration:    5 * time.Second,
				concurrency: concurrency,
				// reportFreq: time.Second,
			}

			if !stress(ctx, dial, reportCh, errorCh, opts) {
				return
			}
		}
	}()

	for {
		select {
		case <-doneCh:
			return
		case report := <-reportCh:
			var entityFrequency int
			if report.entityLatency > 0 {
				entityFrequency = int(math.Round(float64(time.Second) / float64(report.entityLatency)))
			}

			fmt.Printf("report for concurrency=%d:\n", report.opts.concurrency)
			fmt.Printf("  send rate: %d/%v (%d/s)\n",
				report.eventSent/report.opts.concurrency, report.period,
				report.eventSent/report.opts.concurrency/int(report.period/time.Second))
			fmt.Printf("  update rate: %d/%v (%d/s) (%v latency, %d tps)\n",
				report.updatesReceived/report.opts.concurrency, report.period,
				report.updatesReceived/report.opts.concurrency/int(report.period/time.Second),
				report.entityLatency, entityFrequency)
		case err := <-errorCh:
			if !errors.Is(err, context.Canceled) {
				log.Println("error:", err)
			}
		}
	}
}

// func reportFileName(bits ...any) string {
// 	parts := make([]string, len(bits))
// 	for i, bit := range bits {
// 		parts[i] = fmt.Sprint(bit)
// 	}
// 	return strings.Join(parts, "-")
// }
