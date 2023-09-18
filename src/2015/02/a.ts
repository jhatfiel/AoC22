import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let saTotal = 0;

p.onLine = (line) => {
    let sa = 0;
    const [l, w, h] = line.split('x').map(Number);
    let s1 = l*w;
    let s2 = l*h;
    let s3 = w*h;

    let ss = Math.min(s1, Math.min(s2, s3));

    sa = 2*s1 + 2*s2 + 2*s3 + ss;

    saTotal += sa;

    console.log(`${line} SA = ${sa}`);
};

p.onClose = () => {
    console.log(`Total SA = ${saTotal}`);
};

p.run();