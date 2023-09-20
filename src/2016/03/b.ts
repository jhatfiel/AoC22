import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let possible = 0;

let sides = Array.from({length: 3}, () => new Array<number>());

p.onLine = (line) => {
    let arr = line.trim().split(/ +/).map(Number);

    arr.forEach((n, ind) => sides[ind].push(n));

    if (sides[0].length === 3) {

        sides.forEach((sArr) => {
            sArr.sort((a,b) => a-b);
            if (sArr[0] + sArr[1] > sArr[2]) { console.log(`POSSIBLE / ${sArr}`); possible++; }
            else                             { console.log(`   NOT   / ${sArr}`); }
        });

        sides = Array.from({length: 3}, () => new Array<number>());
    }

};

p.onClose = () => {
    console.log(`Total possible: ${possible}`);
    // 1328 is wrong
};

p.run();