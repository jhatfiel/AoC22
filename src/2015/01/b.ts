import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let floor = 0;
    let firstBasement = Infinity;
    line.split('').some((c, ind) => {
        floor += (c=='(')?1:-1;
        if (floor < 0) firstBasement = ind+1;
        return firstBasement < Infinity;
    });
    console.log(`${line} = floor ${floor}, firstBasement = ${firstBasement}`);
};

p.onClose = () => {};

p.run();