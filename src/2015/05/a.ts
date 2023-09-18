import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let nCount= 0;

p.onLine = (line) => {
    // rule check
    let r1 = false;
    let r2 = false;
    let r3 = false;

    // at least 3 vowels
    let arr = line.split(/[aeiou]/);
    r1 = arr.length >= 4;

    // duplicate letter
    for (let i=0; i<line.length-1; i++) {
        if (line[i] === line[i+1]) { r2 = true; break; }
    }

    // invalid strings
    r3 = ['ab', 'cd', 'pq', 'xy'].every((s) => line.indexOf(s) === -1);

    console.log(`${line} ${r1} ${r2} ${r3}`);
    if (r1 && r2 && r3) nCount++;
};

p.onClose = () => {
    console.log(`Total Nice: ${nCount}`);
};

p.run();