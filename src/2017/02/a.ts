import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let checksum = 0;

p.onLine = (line) => {
    let arr = line.split(/\s+/g).map(Number);
    let min = Infinity;
    let max = -Infinity;
    arr.forEach((n) => {
        if (n<min) min=n;
        if (n>max) max=n;
    })
    checksum += max-min;
}

p.onClose = () => {
    console.log(`Checksum = ${checksum}`);
}

p.run();