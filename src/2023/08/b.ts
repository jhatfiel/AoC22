import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

class MapNav {
    constructor(lines: Array<string>) {
        this.turner = lines[0].split('').map(t => t==='L'?0:1);
        lines.slice(2).forEach(line => {
            let [from, directions] = line.split(' = ');
            this.nodeChoice.set(from, directions.replace(/[()]/g, '').split(', '));
        });
    }

    getNextNode(node: string, step: number): string {
        return this.nodeChoice.get(node)[this.turner[step%this.turner.length]]

    }

    turner: Array<number>;
    nodeChoice = new Map<string, Array<string>>();
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let firstSeenMap = new Map<string, number>();

        let mapNav = new MapNav(lines);

        let numSteps = 0;
        let curNodeArr = Array.from(mapNav.nodeChoice.keys()).filter(n => n.endsWith('A'));
        let cycleSize = new Array(curNodeArr.length);
        while (true) {
            let turnIndex = numSteps % mapNav.turner.length;
            curNodeArr.forEach((n, ind) => {
                if (!firstSeenMap.has(n+turnIndex)) {
                    firstSeenMap.set(n + turnIndex, numSteps);
                } else {
                    if (cycleSize[ind] === undefined) cycleSize[ind] = numSteps - firstSeenMap.get(n+turnIndex);
                }
            })

            //console.debug(`[${numSteps.toString().padStart(3, ' ')}/${numSteps%mapNav.turner.length}]: Current Nodes: ${curNodeArr}`)

            if (curNodeArr.every((_, ind) => cycleSize[ind] !== undefined)) break;

            curNodeArr = curNodeArr.map(n => mapNav.getNextNode(n, numSteps));
            numSteps++;
        }

        let turnIndex = numSteps%mapNav.turner.length;
        curNodeArr.forEach((n, ind) => {
            let firstSeen = firstSeenMap.get(n+turnIndex);
            let loopSize = cycleSize[ind];
            console.debug(`[${numSteps}]: ${n+turnIndex} loop (${loopSize})`);
            for (let additionalSteps = 0; additionalSteps < loopSize; additionalSteps++) {
                n = mapNav.getNextNode(n, numSteps+additionalSteps);
                if (n.endsWith('Z')) {
                    let loc = firstSeen+additionalSteps+1;
                    console.debug(`    First end state ${n}: occurs at ${loc}, ${loc+loopSize}, ${loc+2*loopSize}, ${loc+3*loopSize}, ${loc+4*loopSize}, ${loc+5*loopSize}`)
                }
            }
        })

        // the answer is just the LCM of all the cycles, which is: 13740108158591 (yes, 13 trillion steps)
        // this ignores what might happen if the cycle didn't start right at the start location.... but it does so . . . *shrugs
        console.debug(`LCM of all cycles is ${cycleSize.reduce((acc, cs) => acc = Puzzle.lcm(acc, cs), 1)}`)
    });
