import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let validCount = 0;

p.onLine = (line) => {
    let arr = line.split(' ');
    let valid = true;
    let occ = p.countOccurrences(arr);
    occ.forEach((count, pass) => valid = valid && (count===1));
    if (valid) validCount++;
}

p.onClose = () => {

    console.log(`Valid Count: ${validCount}`);
}

p.run();