import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let possible = 0;

p.onLine = (line) => {
    let arr = line.trim().split(/ +/).map(Number).sort((a,b) => a-b);
    if (arr[0] + arr[1] > arr[2]) { console.log(`POSSIBLE ${line} / ${arr}`); possible++; }
    else                          { console.log(`   NOT   ${line} / ${arr}`); }
};

p.onClose = () => {
    console.log(`Total possible: ${possible}`);
};

p.run();