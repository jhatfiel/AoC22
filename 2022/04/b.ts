import fs from 'fs';
import readline from 'readline';

class C {
    constructor() {};

    cScore = 0;

    process(line: string) {
        var [c1, c2] = line.split(',');
        var [c1a, c1b] = c1.split('-').map(Number);
        var [c2a, c2b] = c2.split('-').map(Number);

        if      ((c1a >= c2a && c1a <= c2b) || (c1b >= c2a && c1b <= c2b)) this.cScore++
        else if ((c2a >= c1a && c2a <= c1b) || (c2b >= c1a && c2b <= c1b)) this.cScore++
    }

    value(c: string) {
        if ('a' <= c && c <= 'z') return 1+c.charCodeAt(0)-'a'.charCodeAt(0);
        else if ('A' <= c && c <= 'Z') return 27+c.charCodeAt(0)-'A'.charCodeAt(0);
        else return 0;
    }
}

var c = new C();

var fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log('Score:', c.cScore);
});
