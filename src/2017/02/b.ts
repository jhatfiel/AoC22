import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let checksum = 0;

p.onLine = (line) => {
    let arr = line.split(/\s+/g).map(Number);
    let div = 0;
    arr.forEach((a, aInd) => {
        arr.forEach((b, bInd) => {
            if (aInd !== bInd && a/b==Math.floor(a/b)) div = a/b;
            if (aInd !== bInd && b/a==Math.floor(b/a)) div = b/a;
        })
    })
    checksum += div;
}

p.onClose = () => {
    console.log(`Checksum = ${checksum}`);
}

p.run();