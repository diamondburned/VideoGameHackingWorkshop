package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/AaronLieb/VideoGameHackingWorkshop/experiments/stress/vghw"
	"github.com/pkg/errors"
	"golang.org/x/exp/constraints"
)

type stressOpts struct {
	level       int
	concurrency int
	duration    time.Duration
	reportFreq  time.Duration
}

func stress(
	ctx context.Context,
	dialer dialer,
	reportCh chan<- stressReport,
	errorCh chan<- error,
	opts stressOpts,
) bool {
	doneCh := make(chan struct{})

	reporter := stressReporter{
		opts:   opts,
		period: opts.reportFreq,
	}

	if reporter.period > 0 {
		stop := reporter.StartEmitter(ctx, reportCh)
		defer stop()
	} else {
		defer func() {
			report := reporter.Reset()
			report.period = opts.duration

			reportCh <- report
		}()
	}

	stresser := stresser{
		reporter: &reporter,
		errorCh:  errorCh,
	}

	var wg sync.WaitGroup
	defer wg.Wait()

	// Create a local context. Ensure it's cancelled before we wait for all
	// workers to die out.
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	for i := 0; i < opts.concurrency; i++ {
		wg.Add(1)
		go func() {
			stresser.do(ctx, dialer, opts)
			wg.Done()
		}()
	}

	// Signal to doneCh once all workers are dead.
	go func() {
		wg.Wait()
		close(doneCh)
	}()

	timeout := time.NewTimer(opts.duration)
	defer timeout.Stop()

	for {
		select {
		case <-timeout.C:
			cancel()
			wg.Wait()
			return true
		case <-doneCh:
			return false
		}
	}
}

type stresser struct {
	reporter *stressReporter
	errorCh  chan<- error
}

func (s *stresser) sendErr(ctx context.Context, err error) {
	select {
	case s.errorCh <- err:
	case <-ctx.Done():
	}
}

func (s *stresser) do(ctx context.Context, dialer dialer, opts stressOpts) {
	wsConn, err := dialer(ctx)
	if err != nil {
		s.sendErr(ctx, err)
		return
	}

	conn := newConn(wsConn)
	defer conn.Close()

	eventCh := make(chan vghw.Event)
	go func() {
		defer close(eventCh)

		if err := conn.Listen(ctx, eventCh); err != nil {
			s.sendErr(ctx, err)
			return
		}
	}()

	var onLeave []func()
	var lastEntityMoveTime time.Time
	var lastEntityMoveLatencies [5]time.Duration

	for ev := range eventCh {
		switch ev := ev.(type) {
		case *vghw.HelloEvent:
			if err := conn.Send(ctx, &vghw.JoinCommand{Level: opts.level}); err != nil {
				s.sendErr(ctx, errors.Wrap(err, "cannot send JOIN"))
				return
			}

		case *vghw.WarningEvent:
			s.sendErr(ctx, fmt.Errorf("warning received from server: %s", ev.Message))
			return

		case *vghw.EntityMoveEvent:
			entityMoveTime := time.Now()
			if !lastEntityMoveTime.IsZero() {
				latency := entityMoveTime.Sub(lastEntityMoveTime)
				shiftAppend(lastEntityMoveLatencies[:], latency)
			}
			lastEntityMoveTime = entityMoveTime

			s.reporter.Update(func(r *stressReport) {
				r.updatesReceived++
				r.entityLatency = average(lastEntityMoveLatencies[:])
			})

		case *vghw.LevelJoinedEvent:
			movements := []vghw.Command{
				&vghw.MoveCommand{Position: vghw.Vector{X: 10, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 12, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 14, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 16, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 14, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 12, Y: 10}},
				&vghw.MoveCommand{Position: vghw.Vector{X: 10, Y: 10}},
			}
			idx := 0

			cancel := s.spamCommand(ctx, conn, time.Second/60, func() vghw.Command {
				i := idx
				idx = (idx + 1) % len(movements)
				s.reporter.Update(func(r *stressReport) { r.eventSent++ })
				return movements[i]
			})
			onLeave = append(onLeave, cancel)

		case *vghw.LevelFinishedEvent:
			for _, onLeave := range onLeave {
				onLeave()
			}
			onLeave = nil
		}
	}
}

func (s *stresser) spamCommand(ctx context.Context, conn *conn, rate time.Duration, next func() vghw.Command) (stop func()) {
	ctx, cancel := context.WithCancel(ctx)

	go func() {
		defer cancel()

		ticker := time.NewTicker(rate)
		defer ticker.Stop()

		for {
			cmd := next()

			if err := conn.Send(ctx, cmd); err != nil {
				s.sendErr(ctx, errors.Wrapf(err, "cannot spam command %s", cmd.CommandType()))
				return
			}

			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				// ok
			}
		}
	}()

	return cancel
}

func shiftAppend[T any](slice []T, v T) {
	copy(slice, slice[1:])
	slice[len(slice)-1] = v
}

func average[T constraints.Integer](n []T) T {
	var sum T
	for _, v := range n {
		sum += v
	}
	return T(int64(sum) / int64(len(n)))
}
