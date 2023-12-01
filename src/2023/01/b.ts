import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let translation = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let sum = 0;

        lines.forEach(l => {
            let first: number = undefined;
            let last: number = undefined;
            l.split('').forEach((v, ind) => {
                if (Number.isInteger(Number(v))) {
                    if (first === undefined) first = Number(v);
                    last = Number(v);
                } else {
                    let partialLine = l.slice(ind);
                    Object.keys(translation).forEach(key => {
                        if (partialLine.startsWith(key)) {
                            if (first === undefined) first = translation[key];
                            last = translation[key];
                        }
                    })
                }
            });
            let value = first*10 + last;
            console.debug(`${l} ${value}`)
            sum += value;
        });
        console.debug(sum);
    });
