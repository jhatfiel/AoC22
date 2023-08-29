import fs from 'fs';
import readline from 'readline'

var fn = process.argv[2];

const fileStream = fs.createReadStream(fn);
const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

class CalorieTracker {
    constructor() {};

    total=0;
    bestTotal=0;

    process(num) {
        this.total += num;
    }

    finalize() {
        if (this.total > this.bestTotal) {
            this.bestTotal = this.total;
        }
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

console.log('Overall best total:', ct.bestTotal);

