import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let nCount= 0;

p.onLine = (line) => {
    // rule check
    let r1 = false;
    let r2 = false;

    // 2 letters appear twice
    for (let i=0; i<line.length-2; i++) {
        if (line.lastIndexOf(line.slice(i, i+2)) > i+1) { r1 = true; break; }
    }

    // same letter 1 away
    for (let i=0; i<line.length-2; i++) {
        if (line[i] === line[i+2]) { r2 = true; break; }

    }
    
    console.log(`${line} ${r1} ${r2}`);
    if (r1 && r2) nCount++;
};

p.onClose = () => {
    console.log(`Total Nice: ${nCount}`);
};

p.run();