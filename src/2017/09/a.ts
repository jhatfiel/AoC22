import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    line = line.replaceAll(/!./g, '');
    // get the garbage
    let matches = line.matchAll(/<([^>]*)>/g);
    let totalGarbage = 0;
    for (const match of matches) {
        totalGarbage += match[1].length
    }
    line = line.replaceAll(/<[^>]*>/g, '')
    line = line.replaceAll(/,/g, '');
    let depth = 0;
    let scores = new Array<number>();
    for (const c of line) {
        if (c === '{') scores.push(++depth);
        else depth--;
    }
    console.log(`Overall score: ${scores.reduce((acc, n) => acc += n, 0)}`);
    console.log(`Total Garbage: ${totalGarbage}`);
}

p.onClose = () => {}

p.run();