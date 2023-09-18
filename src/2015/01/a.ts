import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let floor = 0;
    line.split('').forEach((c, ind) => floor += (c=='(')?1:-1);
    console.log(`${line} = floor ${floor}`);
};

p.onClose = () => {};

p.run();