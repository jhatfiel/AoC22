import fs from 'fs';
import readline from 'readline'

var fn = process.argv[2];

const fileStream = fs.createReadStream(fn);
const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

class C {
    constructor() {};

    cScore=0;

    process(line) {
        var chars = line.split('');
        var c1 = chars.slice(0, chars.length/2)
        var c2 = chars.slice(chars.length/2)
        c1.some((c) => { var i=c2.indexOf(c); if (i>-1) { this.cScore += this.value(c); return true } });
    }

    value(c) {
        if ('a' <= c && c <= 'z') return 1+c.charCodeAt()-'a'.charCodeAt()
        else if ('A' <= c && c <= 'Z') return 27+c.charCodeAt()-'A'.charCodeAt() 
        else return 0
    }

}

var c = new C();

for await (const line of rl) {
    c.process(line);
}

console.log('Score:', c.cScore);

