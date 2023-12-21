import { GridParser, Pair, PairToKey } from "../../lib/gridParser.js";
import { existsSync } from 'fs';
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, [/S/g]);
        let gpm = gp.matches[0];
        /**
         * Repeating pattern of the garden, but the repitition is predictable (at least, for the input.  For the sample it doesn't work as well)
         *             A   
         *            HAE  
         *           DDOBB  
         *            GCF  
         *             C   
         * the original (O) square will be oscilating between two states, that's obvious
         * A, B, C, and D all represent the result of entering from a side (again, for input, right in the middle) and getting stats for those propogations
         * E, F, G, and H all represent the result of entering from a corner and getting stats for those propogations
         * grid width,height = 131,131 so largest x,y is 130,130.  Center is 65,65
         * 64 steps to an edge, so 65 steps until you start a new A,B,C,D
         * 129 steps to a corner, so 131 steps until you start a new E,F,G,H tile
         */
        console.debug(`Grid size: ${gp.width},${gp.height}`);
        let originalStats = getStatsFrom(gp, 'O', {x: gpm.x, y: gpm.y})
        let aStats = getStatsFrom(gp, 'A', {x: (gp.width-1)/2, y: gp.height-1})
        let bStats = getStatsFrom(gp, 'B', {x: 0, y: (gp.height-1)/2})
        let cStats = getStatsFrom(gp, 'C', {x: (gp.width-1)/2, y: 0})
        let dStats = getStatsFrom(gp, 'D', {x: gp.width-1, y: (gp.height-1)/2})
        let eStats = getStatsFrom(gp, 'E', {x: 0, y: gp.height-1});
        let fStats = getStatsFrom(gp, 'F', {x: 0, y: 0});
        let gStats = getStatsFrom(gp, 'G', {x: gp.width-1, y: 0});
        let hStats = getStatsFrom(gp, 'H', {x: gp.width-1, y: gp.height-1});

        // the first A occurs after (gp.width+1)/2.  Similar for B-D
        // all future A's occur after gp.width ADDITIONAL steps have passed.  Similar for B-D
        // the first E occurs (N=0) after (gp.width+1)/2 + (gp.height+1)/2 steps have passed.  Similar for F-H
        // all future E's occur after gp.width ADDITIONAL steps have passed.  The difference is, we get (N+1) of these diagonal tiles Similar for B-D

        // first, we have the original square - it will go for the entire time and oscilate between even/odd reachable counts
        let targetSteps = 26501365;
        let totalReach = extrapolateReachFrom(originalStats, targetSteps);

        for (let n=0; ((gp.width+1)/2) + n*gp.width <= targetSteps; n++) {
            //console.debug(`At step [${((gp.width+1)/2 + n*gp.width).toString().padStart(9, ' ')}]: we add ABCD`);
            totalReach += extrapolateReachFrom(aStats, targetSteps - ((gp.width+1)/2 + n*gp.width));
            totalReach += extrapolateReachFrom(bStats, targetSteps - ((gp.width+1)/2 + n*gp.width));
            totalReach += extrapolateReachFrom(cStats, targetSteps - ((gp.width+1)/2 + n*gp.width));
            totalReach += extrapolateReachFrom(dStats, targetSteps - ((gp.width+1)/2 + n*gp.width));
            //console.debug(`At step [${((gp.width+1) + n*gp.width).toString().padStart(9, ' ')}]: we add ${n+1} copies of EFGH`);
            if ((gp.width+1) + n*gp.width <= targetSteps) {
                totalReach += (n+1)*extrapolateReachFrom(eStats, targetSteps - ((gp.width+1) + n*gp.width));
                totalReach += (n+1)*extrapolateReachFrom(fStats, targetSteps - ((gp.width+1) + n*gp.width));
                totalReach += (n+1)*extrapolateReachFrom(gStats, targetSteps - ((gp.width+1) + n*gp.width));
                totalReach += (n+1)*extrapolateReachFrom(hStats, targetSteps - ((gp.width+1) + n*gp.width));
            }
            if (n%1000 === 0) console.debug(`Steps remaining: ${targetSteps - ((gp.width+1) + n*gp.width)}`);
        }
        console.log(`Total Reachable: ${totalReach}`);
    });

type StepStats = {
    name: string,
    stepsTillTopBorder: number,
    stepsTillLeftBorder: number,
    stepsTillRightBorder: number,
    stepsTillBottomBorder: number,
    stepsTillTL: number,
    stepsTillTR: number,
    stepsTillBL: number,
    stepsTillBR: number,
    reachCount: Array<number>,
    oddStepsReachCount: number,
    evenStepsReachCount: number
};

function getStatsFrom(gp: GridParser, name: string, start: Pair): StepStats {
    console.debug(`Stats from: ${PairToKey(start)}`);
    let result: StepStats;
    let fn = `./cache/${name}.cache`;
    if (existsSync(fn)) {
        result = puzzle.restore(fn);
    } else {
        result = {
            name,
            stepsTillTopBorder: NaN,
            stepsTillLeftBorder: NaN,
            stepsTillRightBorder: NaN,
            stepsTillBottomBorder: NaN,
            stepsTillTL: NaN,
            stepsTillTR: NaN,
            stepsTillBL: NaN,
            stepsTillBR: NaN,
            reachCount: new Array<number>(),
            oddStepsReachCount: NaN,
            evenStepsReachCount: NaN
        };
        let reach = new Set<string>();
        reach.add(PairToKey(start));

        //debugReach(0, reach);
        result.reachCount.push(reach.size);
        for (let stepNum = 0; ; stepNum++) {
            let newReach = new Set<string>();
            reach.forEach(p => {
                let canMoveTo = gp.getNeighbors(p);
                canMoveTo.forEach((v, k) => {
                    let [x, y] = k.split(',').map(Number);
                    if (gp.grid[y][x] !== '#') newReach.add(k);
                    if (y === 0 && Number.isNaN(result.stepsTillTopBorder)) result.stepsTillTopBorder = stepNum;
                    if (x === 0 && Number.isNaN(result.stepsTillLeftBorder)) result.stepsTillLeftBorder = stepNum;
                    if (y === gp.height-1 && Number.isNaN(result.stepsTillBottomBorder)) result.stepsTillBottomBorder = stepNum;
                    if (x === gp.width-1 && Number.isNaN(result.stepsTillRightBorder)) result.stepsTillRightBorder = stepNum;
                    if (x === 0 && y === 0 && Number.isNaN(result.stepsTillTL)) result.stepsTillTL = stepNum;
                    if (x === gp.width-1 && y === 0 && Number.isNaN(result.stepsTillTR)) result.stepsTillTR = stepNum;
                    if (x === 0 && y === gp.height-1 && Number.isNaN(result.stepsTillBL)) result.stepsTillBL = stepNum;
                    if (x === gp.width-1 && y === gp.height-1 && Number.isNaN(result.stepsTillBR)) result.stepsTillBR = stepNum;
                })
            })

            reach = newReach;
            //debugReach(stepNum+1, reach);
            if (stepNum >= 2 && result.reachCount[stepNum-1] === reach.size
                && !Number.isNaN(result.stepsTillTopBorder)
                && !Number.isNaN(result.stepsTillLeftBorder)
                && !Number.isNaN(result.stepsTillRightBorder)
                && !Number.isNaN(result.stepsTillBottomBorder)
                && !Number.isNaN(result.stepsTillTL)
                && !Number.isNaN(result.stepsTillTR)
                && !Number.isNaN(result.stepsTillBL)
                && !Number.isNaN(result.stepsTillBR)) break;
            result.reachCount.push(reach.size);
        }
        let last = result.reachCount[result.reachCount.length-1];
        let prevLast = result.reachCount[result.reachCount.length-2];
        result.oddStepsReachCount = (result.reachCount.length%2===0)?last:prevLast;
        result.evenStepsReachCount = (result.reachCount.length%2===0)?prevLast:last;

        puzzle.cache(result, fn);
    }

    console.debug(JSON.stringify(result));
    return result;
}

function debugReach(stepNum: number, reach: Set<string>) {
    console.debug(`After: ${stepNum} steps, total reach = ${reach.size}`);
    /*
    reach.forEach((v) => {
        if (v.startsWith('0,')) console.debug(`edge ${v}`)
    });
    /*
    let str = '';

    reach.forEach((v) => {
        str += v + ' / ';
    })

    console.debug(str);
    */
}

function extrapolateReachFrom(stepStats: StepStats, stepsRemaining: number): number {
    let result = 0;
    if (stepsRemaining > stepStats.reachCount.length) {
        // calculate
        result = (stepsRemaining%2===0)?stepStats.evenStepsReachCount:stepStats.oddStepsReachCount;
    } else {
        result = stepStats.reachCount[stepsRemaining];
    }
    //console.debug(`Calculating reachable for ${stepStats.name} with stepsRemaining: ${stepsRemaining} = ${result}`);
    return result;
}
