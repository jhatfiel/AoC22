import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let validCount = 0;

p.onLine = (line) => {
    let arr = line.split(' ');
    let valid = true;
    arr.some((pass, ind) => {
        if (arr.indexOf(pass, ind+1) !== -1) valid = false;
        p.permute(pass.split('')).some((pass2) => {
            if (arr.indexOf(pass2, ind+1) !== -1) valid = false;
            return !valid;
        })
        return !valid;
    });
    if (valid) validCount++;
    console.log(`${line} ${valid}`)
}

p.onClose = () => {
    // 506 is too high
    // 377 is too high
    console.log(`Valid Count: ${validCount}`);
}

p.run();

function reverse(s: string): string {
    return s.split('').reverse().join('');
}