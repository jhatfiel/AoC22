import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let asleep = new Map<number, Map<number, number>>();
        let guardMap: Map<number, number>;
        let guardId = -1;
        let sleepStart = 0;
        lines.sort().forEach((line) => {
            if (line.indexOf('begins') !== -1) {
                [guardId] = line.match(/Guard #([\d]+) begins shift/).slice(1).map(Number);
                guardMap = asleep.get(guardId);
                if (guardMap === undefined) {
                    guardMap = new Map<number, number>();
                    asleep.set(guardId, guardMap);
                    for (let i=0; i<60; i++) {
                        guardMap.set(i, 0);
                    }
                }
            } else if (line.indexOf('falls') !== -1) {
                [sleepStart] = line.match(/([\d]+)] falls asleep/).slice(1).map(Number);
            } else if (line.indexOf('wakes') !== -1) {
                let [wakeup] = line.match(/([\d]+)] wakes up/).slice(1).map(Number);
                for (let i=sleepStart; i<wakeup; i++) {
                    guardMap.set(i, guardMap.get(i)+1);
                }
            }
        })

        let mostAsleepMinutes = -Infinity;
        let mostAsleepId = 0;
        Array.from(asleep.keys()).forEach((id) => {
            guardMap = asleep.get(id);
            let asleepMinutes = Array.from(guardMap.keys()).reduce((acc, m) => acc + guardMap.get(m), 0);

            if (asleepMinutes > mostAsleepMinutes) {
                mostAsleepMinutes = asleepMinutes;
                mostAsleepId = id;
            }
        })

        guardMap = asleep.get(mostAsleepId);
        let mostAsleepMinute = 0;
        let mostAsleepMinuteCount = -Infinity;
        guardMap.forEach((cnt, m) => {
            if (cnt > mostAsleepMinuteCount) {
                mostAsleepMinuteCount = cnt;
                mostAsleepMinute = m;
            }
        })

        console.log(`Most Asleep: ${mostAsleepId} - minute: ${mostAsleepMinute}, score = ${mostAsleepId * mostAsleepMinute}`)

        // part 2 - find the most asleep minute for any guard

        mostAsleepId = 0;
        mostAsleepMinute = 0;
        mostAsleepMinuteCount = -Infinity;
        Array.from(asleep.keys()).forEach((id) => {
            guardMap = asleep.get(id);
            guardMap.forEach((cnt, m) => {
                if (cnt > mostAsleepMinuteCount)  {
                    mostAsleepMinuteCount = cnt;
                    mostAsleepMinute = m;
                    mostAsleepId = id;
                }
            })
        })
        console.log(`Most Asleep Minute: ${mostAsleepMinute} by ${mostAsleepId}, score = ${mostAsleepId * mostAsleepMinute}`)
    });