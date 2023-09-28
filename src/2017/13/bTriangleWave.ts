import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let depths = new Map<number, number>();

p.onLine = (line) => {
    console.log(line);
    let [ind, d] = line.split(': ').map(Number);
    depths.set(ind, d);
}

p.onClose = () => {
    for (let delay=0; ; delay++) {
        if (!Array.from(depths.keys()).some((s) => positionAfter(depths.get(s)-1, s+delay) === 0)) { console.log(`Wait ${delay}`); break; };
    }
}

function positionAfter(max: number, delay=0): number {
    return triangleWave(max/2, max*2, delay-max/2)+max/2;
}
function triangleWave(amp: number, period: number, delay=0): number {
    return 4*amp/period * Math.abs((((delay-period/4)%period)+period)%period - period/2) - amp;
}

p.run();