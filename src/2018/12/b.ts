import { Puzzle } from '../../lib/puzzle.js';

const SIZE = 100000;
const OFFSET = SIZE/2;
let pots = Array.from({length: SIZE}, ()=>false);
let generation = 0;
let surviveRules = Array<string>();
const numGenerations = 50000000000;
let left = OFFSET, right = OFFSET;

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines[0].split('').forEach((c, ind) => pots[OFFSET+ind] = (c==='#'));
        right = OFFSET+lines[0].length;
        console.debug(lines[0])
        debug();
        lines.slice(2).forEach((line) => {
            if (line.endsWith('#')) {
                surviveRules.push(line.split(' => ')[0]);
            }
        })

        // this loop needs to continue until we find a "stable" configuration, which has:
        // 1) each potted plant has moved exactly 1 to the right from the previous generation
        //  (that works for my data set, some data sets might walk to the left instead of to the right)
        let done = false;
        while (!done) {
            generation++;
            let newPots = Array.from({length: SIZE}, ()=> false);
            let scanLeft = left-2;
            let scanRight = right+3;
            left = Infinity; right = -Infinity;
            for (let i=scanLeft; i<scanRight; i++) {
                let s = pots.slice(i-2, i+3).map(v => v?'#':'.').join('');
                if (surviveRules.indexOf(s) !== -1) {
                    newPots[i] = true;
                    if (i < left) left = i;
                    if (i > right) right = i;
                }
            }
            // check to see if this generation is a copy of last generation but just moved one to the right
            done = pots.every((v, ind) => ind === SIZE-1 || newPots[ind+1] === v);
                
            pots = newPots;
            debug();
        }

        outputResults();
    });

function outputResults() {
    debug();
    console.debug(`true pots: ${pots.reduce((acc, v, ind) => acc += (v)?((ind-OFFSET)+','):'', '')}`)
    console.log(`(final) sum of pots with plants: ${pots.reduce((acc, v, ind) => acc += (v)?((ind-OFFSET + (numGenerations-generation))):0, 0)}`)
}

function debug() {
    console.debug(generation.toString().padStart(2, ' ') + ': ' + pots.slice(OFFSET-5, OFFSET+170).map(v => v?'#':'.').join('') + left + ',' + right)
}