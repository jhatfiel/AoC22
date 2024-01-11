export {};
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

class C {
    constructor() {};

    shared: Array<string> = [];
    cScore = 0;
    num = 0;

    process(line: string) {
        var chars = line.split('');
        if (this.num == 0) this.shared = chars;
        else {
            this.shared = this.shared.filter((c) => chars.indexOf(c) !== -1);
            this.shared = this.shared.filter((c, i, a) => a.indexOf(c) === i);
        }

        this.num++;
        if (this.num == 3) {
            if (this.shared.length !== 1) { console.error('Not exactly 1 shared entry', this.shared); }
            this.cScore += this.value(this.shared[0]);

            this.num = 0;
            this.shared = [];
        }
    }

    value(c: string) {
        if ('a' <= c && c <= 'z') return 1+c.charCodeAt(0)-'a'.charCodeAt(0);
        else if ('A' <= c && c <= 'Z') return 27+c.charCodeAt(0)-'A'.charCodeAt(0);
        else return 0;
    }

}

var c = new C();

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log('Score:', c.cScore);
});
