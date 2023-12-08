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
        const LAST_SEEN = new Map<string, number>();

        let mapNav = new MapNav(lines);

        let steps = 0;
        let curNodeArr = Array.from(mapNav.nodeChoice.keys()).filter(n => n.endsWith('A'));
        console.debug(`[0]: Current Nodes: ${curNodeArr}`)
        while (! curNodeArr.every(n => n.endsWith('Z'))) {
            let turnIndex = steps % mapNav.turner.length;
            if (curNodeArr.every(n => LAST_SEEN.has(n+turnIndex)))
                break;

            curNodeArr.forEach(n => {
                LAST_SEEN.set(n + turnIndex, steps);
            })
            curNodeArr = curNodeArr.map(n => mapNav.getNextNode(n, steps));
            steps++;
        }

        let turnIndex = steps%mapNav.turner.length;
        curNodeArr.forEach(n => {
            let loopSize = steps - LAST_SEEN.get(n+turnIndex)
            console.debug(`[${steps}]: ${n+turnIndex} loop (${loopSize})`);
            for (let additionalSteps = 0; additionalSteps < loopSize; additionalSteps++) {
                n = mapNav.getNextNode(n, steps+additionalSteps);
                if (n.endsWith('Z')) {
                    console.debug(`    [${additionalSteps}] - Found node ending in Z: ${n}`)
                }
            }
        })

        console.debug(`9, 15, 3 = ${Puzzle.first_alignment(9, 15, 3)}`)
        console.debug(`30, 38, 6 = ${Puzzle.first_alignment(30, 38, 6)}`)
        console.debug(`9, 12, 5= ${Puzzle.first_alignment(9, 12, 5)}`)


        console.debug(`[${steps}]: Current Nodes: ${curNodeArr}`)
    });
