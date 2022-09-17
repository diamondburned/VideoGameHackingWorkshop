import { reef } from "/public/js/deps.js";
import { escapeHTML } from "/public/js/html/escape.js";

export class Component {
    store;
    handlers;

    constructor(element, handlers) {
        this.store = reef.store({
            levelInfo: [/* LevelInfo */],
            leaderboards: new Map(), // Map<number, LevelScore[]>
            personalScores: new Map(), // Map<number, PersonalScore>
        });
        this.handlers = handlers;

        reef.component(element, () => this.#render());
    }

    set levelInfo(info) {
        this.store.levelInfo = info;
    }

    #render() {
        if (!this.store.levelInfo) {
            return "";
        }

        const infos = this.store.levelInfo.map((level) => {
            const info = {
                number: level.number,
                name: level.name,
                desc: level.desc,
            };

            const leaderboard = this.store.leaderboards.get(level.number);
            if (leaderboard && leaderboard.length != 0) {
                info.leaderboard = leaderboard;
                info.globalBest = {
                    username: leaderboard[0].username,
                    bestTime: leaderboard[0].bestTime,
                };
            } else {
                info.leaderboard = [
                    {
                        rank: 1,
                        username: "aarolieb",
                        bestTime: 100204,
                    },
                    {
                        rank: 2,
                        username: "etok",
                        bestTime: 102475,
                    },
                    {
                        rank: 3,
                        username: "diamondburned",
                        bestTime: 204855,
                    },
                ];
                info.globalBest = {
                    username: "aarolieb",
                    bestTime: 100204,
                };
            }

            const personalScore = this.store.personalScores.get(level.number);
            if (personalScore) {
                info.personalBestTime = personalScore.bestTime;
            } else {
                info.personalBestTime = 204855;
            }

            return info;
        });

        // deno-fmt-ignore
        return infos.map((info) => `
			<div class="level-item" id="level-${info.number}">
				<h2>
					Level ${info.number}
					${info.name ? `<small>(${escapeHTML(info.name)})</small>` : ""}
				</h2>
				<p class="level-scores">
					${info.globalBest ? `
						<span>Global Best Time</span>
						<span>
							<time datetime="${formatTime(info.globalBest.bestTime)}">
								${formatTime(info.globalBest.bestTime)}
							</time>
							<small class="username">
								(${escapeHTML(info.globalBest.username)})
							</small>
						</span>
						<br />
					` : ""}
					${info.personalScore ? `
						<span>Personal Best Time</span>
						<span>
							<time datetime="${formatTime(info.personalBestTime)}">
								${formatTime(info.personalBestTime)}
							</time>
						</span>
					` : ""}
				</p>
				<div class="level-extras">
					<p class="level-description">
						${info.desc ? escapeHTML(info.desc) : ""}
					</p>
					${info.leaderboard ? `
						<div class="level-leaderboard">
							<h3>Leaderboard</h3>
							<table>
								<thead>
									<tr>
										<th class="rank">Rank</th>
										<th class="user">Username</th>
										<th class="time">Best Time</th>
									</tr>
								</thead>
								<tbody>
									${info.leaderboard.map((score) => `
										<tr>
											<td class="rank">${score.rank}</td>
											<td class="user">${escapeHTML(score.username)}</td>
											<td class="time">${formatTime(score.bestTime)}</td>
										</tr>
									`)}
								</tbody>
							</table>
						</div>
					` : ""}
				</div>
			</div>
		`);
    }
}

const msDay = 1 * // 1 day
    24 * // 24 hours a day
    60 * // 60 minutes an hour
    60 * // 60 seconds a minute
    1000; // 1000 milliseconds a second

function formatTime(ms) {
    if (ms > msDay) {
        return "Too long (>1d)";
    }

    const d = new Date(0);
    d.setMilliseconds(ms);
    return d.toISOString().replace(/.*T([0-9:.]+)Z/, "$1");
}
