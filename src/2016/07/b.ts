import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2] ?? process.cwd() + '/sample');
let cnt = 0;

p.onLine = (line) => {
    const arr = line.split(/[\[\]]/);
    let hasABBAOutside = false;
    let hasABBAInside = false;
    let outsideABA = new Set<string>();
    let insideABA = new Set<string>();
    arr.forEach((s, ind) => {
        s.split('').forEach((v, i, a) => {
            if (i < a.length-3 && a[i] === a[i+3] && a[i+1] === a[i+2] && a[i] !== a[i+1]) {
                if (ind % 2) hasABBAInside = true;
                else hasABBAOutside = true;
            }
            if (i < a.length-2 && a[i] === a[i+2] && a[i] !== a[i+1]) {
                //console.log(`found 3 character pattern ${ind} / ${i}`)
                let str = a.slice(i, i+3).join('');
                if (ind % 2) insideABA.add(str);
                else outsideABA.add(str);
            }
        })
    })
    if (Array.from(outsideABA).some((s) => insideABA.has(s[1]+s[0]+s[1]))) {
        cnt++; 
        console.log(`${line} PASSES!`);
    } else {
        console.log(`${line} fails ${hasABBAOutside} / ${hasABBAInside} / ${Array.from(outsideABA).some((s) => insideABA.has(s[1]+s[0]+s[1]) )}`);
    }
};

p.onClose = () => {
    console.log(`Count: ${cnt}`);
    // 108 is too high
};

p.run();