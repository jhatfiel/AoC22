import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let depths = new Map<number, number>();
let directions = new Map<number, number>();
let scanners: Array<number>;
let maxScanners = 0;

p.onLine = (line) => {
    console.log(line);
    let [ind, d] = line.split(': ').map(Number);
    depths.set(ind, d);
    maxScanners = ind+1;
}

p.onClose = () => {
    scanners = Array.from({length: maxScanners}, () => -1);

    let severityScore = 0;
    depths.forEach((_, ind) => {
        scanners[ind] = 0
        directions.set(ind, 1);
    });
    let scannersAtPlus1: Array<number>;
    let directionsAtPlus1 = new Map<number, number>();

    let delay = 0;
    for (; ; delay++) {
        severityScore = 0;

        if (scannersAtPlus1) scanners = scannersAtPlus1
        directionsAtPlus1.forEach((d, s) => directions.set(s, d));

        for (let position = 0; position < maxScanners; position++) {
            //console.log(`Position ${position.toString().padStart(3, ' ')}   ` + 'v'.padStart(position*5+1, ' '))
            //console.log(`Scanners:   ${scanners.map((n) => n.toString().padStart(4, ' '))}`)
            //console.log(`Directions: ${scanners.map((n, ind) => (directions.get(ind)?.toString() ?? '').padStart(4, ' '))}`)
            //console.log(`Max Depths: ${scanners.map((n, ind) => (depths.get(ind)?.toString() ?? '').padStart(4, ' '))}`)
            // check if we are seen
            if (scanners[position] === 0) {
                severityScore++;
            }
            // move scanners
            directions.forEach((d, s) => {
                if (scanners[s]+d === -1 || scanners[s]+d === depths.get(s)) { d = -1*d; directions.set(s, d); }
                scanners[s] += d;
            })
            if (position === 0) {
                scannersAtPlus1 = [...scanners];
                directions.forEach((d, s) => directionsAtPlus1.set(s, d));
            }
            if (severityScore > 0) break;
        }
        if (delay%100000 === 0) console.log(`[${delay.toString().padStart(10, ' ')}] Severity score: ${severityScore}`);
        if (severityScore === 0) break;
    }

    console.log(`Required delay: ${delay}`);
}

p.run();