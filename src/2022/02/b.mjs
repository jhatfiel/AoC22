import fs from 'fs';
import readline from 'readline'

var fn = process.argv[2];

const fileStream = fs.createReadStream(fn);
const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

class RPSPlayer {
    constructor() {};

    cScore=0;
    score = {'X': 0, 'Y': 3, 'Z': 6};
    result = {'A': { 'X': 'C', 'Y': 'A', 'Z': 'B' },
              'B': { 'X': 'A', 'Y': 'B', 'Z': 'C' },
              'C': { 'X': 'B', 'Y': 'C', 'Z': 'A' }};

    process(line) {
        var [p, r] = line.split(' ');
        var u = this.result[p][r];
        var base = u.charCodeAt()-'A'.charCodeAt() + 1;
        this.cScore += base + this.score[r];
    }
}

var c = new RPSPlayer();

for await (const line of rl) {
    c.process(line);
}

console.log('Score:', c.cScore);

