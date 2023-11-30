import { Puzzle } from '../../lib/puzzle.js';

const SIZE = 10000;
const OFFSET = SIZE/2;
let pots = Array.from({length: SIZE}, ()=>false);
let generation = 0;
let surviveRules = Array<string>();
const numGenerations = 20;

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines[0].split('').forEach((c, ind) => pots[OFFSET+ind] = (c==='#'));
        console.debug(lines[0])
        debug();
        lines.slice(2).forEach((line) => {
            if (line.endsWith('#')) {
                surviveRules.push(line.split(' => ')[0]);
            }
        })

        while (generation < numGenerations) {
            generation++;
            let newPots = Array.from({length: SIZE}, ()=> false);
            for (let i=2; i<SIZE-2; i++) {
                let s = pots.slice(i-2, i+3).map(v => v?'#':'.').join('');
                if (surviveRules.indexOf(s) !== -1) {
                    newPots[i] = true;
                }
            }
            pots = newPots;
            debug();
        }

        outputResults();
    });

function outputResults() {
    console.debug(generation.toString().padStart(2, ' ') + ': ' + pots.slice(OFFSET-5, OFFSET+50).map(v => v?'#':'.').join(''))
    console.debug(`true pots: ${pots.reduce((acc, v, ind) => acc += (v)?((ind-OFFSET)+','):'', '')}`)
    console.log(`sum of pots with plants: ${pots.reduce((acc, v, ind) => acc += (v)?((ind-OFFSET)):0, 0)}`)
}

function debug() {
    console.debug(generation.toString().padStart(2, ' ') + ': ' + pots.slice(OFFSET-5, OFFSET+50).map(v => v?'#':'.').join(''))
}