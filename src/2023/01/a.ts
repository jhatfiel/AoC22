import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let sum = 0;

        lines.forEach(l => {
            let first: number = undefined;
            let last: number = undefined;
            l.split('').map(Number).forEach(v => {
                if (Number.isInteger(v)) {
                    if (first === undefined) first = v;
                    last = v;
                }
            });
            let value = first*10 + last;
            sum += value;
        });
        console.debug(sum);
    });
