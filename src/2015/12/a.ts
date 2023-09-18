import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    console.log(line);

    let matches = line.matchAll(/-?[0-9]+/g);
    let sum = 0;

    for (const match of matches) {
        sum += Number(match[0]);
    }

    console.log(`sum is ${sum}`);
};

p.onClose = () => {
};

p.run();