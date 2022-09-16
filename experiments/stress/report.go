package main

import (
	"context"
	"sync"
	"time"
)

type stressReport struct {
	opts   stressOpts
	period time.Duration

	// time is the time the report was made.
	time time.Time
	// eventSent is the number of event sent for this report.
	eventSent       int
	updatesReceived int
	entityLatency   time.Duration
}

type stressReporter struct {
	opts   stressOpts
	period time.Duration

	mut    sync.Mutex
	report stressReport
}

func (r *stressReporter) Reset() (last stressReport) {
	r.mut.Lock()
	defer r.mut.Unlock()

	last = r.report
	last.opts = r.opts
	last.period = r.period

	r.report = stressReport{
		opts:   r.opts,
		period: r.period,
		time:   time.Now(),
	}

	return
}

func (r *stressReporter) StartEmitter(ctx context.Context, dst chan<- stressReport) func() {
	if r.period == 0 {
		panic("bug: stressReporter.period must be >0")
	}

	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done()

		ticker := time.NewTicker(r.period)
		defer ticker.Stop()

		var lastReport stressReport
		var dstCh chan<- stressReport

		for {
			select {
			case <-ctx.Done():
				return

			case <-ticker.C:
				lastReport = r.Reset()
				dstCh = dst

			case dstCh <- lastReport:
				dstCh = nil
			}
		}
	}()

	return wg.Wait
}

func (r *stressReporter) Update(f func(*stressReport)) {
	r.mut.Lock()
	defer r.mut.Unlock()

	f(&r.report)
}
