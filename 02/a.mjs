import fs from 'fs';
import readline from 'readline'

var fn = process.argv[2];

const fileStream = fs.createReadStream(fn);
const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

class RPSPlayer {
    constructor() {};

    score=0;
    result = {'A': { 'X': 3, 'Y': 6, 'Z': 0 },
              'B': { 'X': 0, 'Y': 3, 'Z': 6 },
              'C': { 'X': 6, 'Y': 0, 'Z': 3 }};

    process(line) {
        var [p, u] = line.split(' ');
        var base = u.charCodeAt()-'W'.charCodeAt();
        this.score += base + this.result[p][u];
    }
}

var c = new RPSPlayer();

for await (const line of rl) {
    c.process(line);
}

console.log('Score:', c.score);

