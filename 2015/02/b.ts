import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let pTotal = 0;

p.onLine = (line) => {
    const [l, w, h] = line.split('x').map(Number);
    let p1 = 2*l + 2*w;
    let p2 = 2*l + 2*h;
    let p3 = 2*w + 2*h;

    let b = l*w*h;

    let p = Math.min(p1, Math.min(p2, p3));
    pTotal += p + b;

    console.log(`${line} P+B = ${p+b}`);
};

p.onClose = () => {
    console.log(`Total P = ${pTotal}`);
};

p.run();