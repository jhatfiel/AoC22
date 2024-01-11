import { createReadStream } from "fs";
import { createInterface } from "readline";

class C {
    constructor() { };

    cScore = 0;
    buffer = '';
    resetSize = 14;

    process(line: string) {
        for (var i=0; i<line.length; i++) {
            this.buffer += line.charAt(i);
            console.log('buffer is now: ' + this.buffer);
            if (this.buffer.length > this.resetSize) this.buffer = this.buffer.substring(1); 
            console.log('buffer reset : ' + this.buffer);
            if (this.buffer.length == this.resetSize && this.allDifferent()) { console.log(i+1); this.cScore = i+1; return; }
        }
    }

    allDifferent() {
        return this.buffer.split('').every((c, i, a) => a.indexOf(c) === i);
    }
}

var c = new C();

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log('Final score: ', c.cScore);
});
