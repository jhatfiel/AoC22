import fs from 'fs';
import readline from 'readline'

var fn = process.argv[2];

const fileStream = fs.createReadStream(fn);
const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

class CalorieTracker {
    constructor() {};

    total=0;
    best=[];

    process(num) {
        this.total += num;
    }

    finalize() {
        this.best.push(this.total);
        this.best.sort((a,b) => b-a);
        this.best = this.best.slice(0, 3);
        this.total=0;
    }
}

var ct = new CalorieTracker();

for await (const line of rl) {
    if (line) {
        ct.process(Number(line));
    } else {
        ct.finalize();
    }
}

ct.finalize();

console.log('Best 3 total:', ct.best.reduce((v, total) => total+v, 0));

