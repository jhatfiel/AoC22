import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let depths = new Map<number, number>();

p.onLine = (line) => {
    let [ind, d] = line.split(': ').map(Number);
    depths.set(ind, d-1);
}

p.onClose = () => {
    for (let delay=0; ; delay++) {
        if (!Array.from(depths.keys()).some((s) => p.positionAfter(depths.get(s), s+delay) === 0)) { console.log(`Wait ${delay}`); break; };
    }
}

p.run();
