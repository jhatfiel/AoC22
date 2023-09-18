import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2] ?? process.cwd() + '/sample');
let cnt = 0;

p.onLine = (line) => {
    const arr = line.split(/[\[\]]/);
    let hasPatOutside = false;
    let hasPatInside = false;
    arr.forEach((s, ind) => {
        s.split('').forEach((v, i, a) => {
            if (i < a.length-3 && a[i] === a[i+3] && a[i+1] === a[i+2] && a[i] !== a[i+1]) {
                if (ind % 2) hasPatInside = true;
                else hasPatOutside = true;
            }
        })
    })
    if (hasPatOutside && !hasPatInside) {
        cnt++; 
        console.log(`${line} PASSES!`);
    } else {
        console.log(`${line} fails ${hasPatOutside} / ${hasPatInside}`);
    }
};

p.onClose = () => {
    console.log(`Count: ${cnt}`);
    // 108 is too high
};

p.run();