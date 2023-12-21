import { GridParser, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let stepNum = 0;
let stepsNeeded = 300;
await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, [/#/g, /S/g]);
        let possible = new Set<string>();
        //possible.add(PairToKey(gp.matches.filter(m => m.typeIndex === 1)[0]));
        let rocks = new Set<string>(gp.matches.filter(m => m.typeIndex === 0).map(gpm => PairToKey({x: gpm.x, y: gpm.y})));
        possible.add('0,0');

        for (stepNum = 0; stepNum < stepsNeeded; stepNum++) {
            debugPossible(possible);

            let newPossible = new Set<string>();
            possible.forEach(p => {
                let canMoveTo = gp.getNeighbors(p);
                canMoveTo.forEach((v, k) => {
                    if (!rocks.has(k)) newPossible.add(k);
                })
            })

            possible = newPossible;
        }
        debugPossible(possible);
    });

function debugPossible(possible: Set<string>) {
    console.debug(`After: ${stepNum} steps, total possible = ${possible.size}`);
    /*
    possible.forEach((v) => {
        if (v.startsWith('0,')) console.debug(`edge ${v}`)
    });
    /*
    let str = '';

    possible.forEach((v) => {
        str += v + ' / ';
    })

    console.debug(str);
    */
}