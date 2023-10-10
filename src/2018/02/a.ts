import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let has2=0, has3=0;
        lines.forEach((line) => {
            let occ = puzzle.countOccurrences(line.split(''));
            Array.from(occ.keys()).some((k) => occ.get(k) === 2)?has2++:null;
            Array.from(occ.keys()).some((k) => occ.get(k) === 3)?has3++:null;
        })
        console.log(has2*has3);
    });