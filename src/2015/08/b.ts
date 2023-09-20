import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let diff = 0;

p.onLine = (line) => {
    let str = JSON.stringify(line);
    console.log(`${line} is ${str}, diff is ${line.length - str.length}`);
    diff += (line.length - str.length);
};

p.onClose = () => {
    console.log(`Overall diff is ${diff}`);
};

p.run();