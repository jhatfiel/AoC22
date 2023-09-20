import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let locations = new Map<string, number>();
    let sr = 0;
    let sc = 0;
    let rr = 0;
    let rc = 0;
    locations.set(`${sr},${sc}`, 1);
    locations.set(`${rr},${rc}`, 1);
    line.split('').forEach((c, i) => {
        let k = '';
        if (i % 2 === 0) {
            switch (c) {
                case '>': sc++; break;
                case '<': sc--; break;
                case '^': sr--; break;
                case 'v': sr++; break;
            }
            k = `${sr},${sc}`;
        } else {
            switch (c) {
                case '>': rc++; break;
                case '<': rc--; break;
                case '^': rr--; break;
                case 'v': rr++; break;
            }
            k = `${rr},${rc}`;

        }
        if (locations.has(k)) locations.set(k, locations.get(k)!+1);
        else                  locations.set(k, 1);
    })
    console.log(`${line} location size = ${locations.size}`);
};

p.onClose = () => {};

p.run();