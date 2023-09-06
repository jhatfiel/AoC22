import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let locations = new Map<string, number>();
    let row = 0;
    let col = 0;
    locations.set(`${row},${col}`, 1);
    line.split('').forEach((c) => {
        switch (c) {
            case '>': col++; break;
            case '<': col--; break;
            case '^': row--; break;
            case 'v': row++; break;
        }
        const k = `${row},${col}`;
        if (locations.has(k)) locations.set(k, locations.get(k)!+1);
        else                  locations.set(k, 1);
    })
    console.log(`${line} location size = ${locations.size}`);
};

p.onClose = () => {};

p.run();