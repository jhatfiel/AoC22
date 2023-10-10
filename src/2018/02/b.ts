import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.some((line) => {
            let lineArr = line.split('');
            return lines.some((line2) => {
                if (lineArr.reduce((acc, l1, ind) => acc + ((l1!==line2.slice(ind, ind+1))?1:0), 0) === 1) {
                    console.log(line);
                    console.log(line2);
                    return true;
                }
            });
        })
    });