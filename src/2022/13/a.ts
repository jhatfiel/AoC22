import fs from 'fs';
import readline from 'readline';
import util from 'node:util';

class C {
    result=0;
    pair = 1;
    p1?: Array<any>;
    p2?: Array<any>;
    process(line: string) {
        if (!this.p1) {
            this.p1 = this.handle(line);
        } else {
            this.p2 = this.handle(line);
            // compare packets
            this.evaluate();

            // get ready for next pairs
            this.p1 = undefined;
            this.pair++;
        }
    }

    handle(line: string): Array<any> { return eval(line); }

    evaluate() {
        if (!this.p1 || !this.p2) return;
        let result = this._evaluate(this.p1, this.p2, '');
        
        // if correct order
        if (result <= 0) {
            console.log(this.pair + ': GOOD');
            this.result += this.pair;
        } else {
            console.log(this.pair + ': BAD');
        }
    }

    _evaluate(p1: any, p2: any, spacing: string): number {
        let result = 0;
        console.log(`${spacing}- Compare ${util.inspect(p1, {depth: null, compact: true, breakLength: Infinity})} vs ${util.inspect(p2, {depth: null, compact: true, breakLength: Infinity})}`);
        if (typeof p1 === 'number' && typeof p2 === 'number') {
             if (p1-p2 > 0) console.log(`${spacing}- Right side is smaller, so inputs are not in the right order`);
             if (p2-p1 > 0) console.log(`${spacing}- Left side is smaller, so inputs are in the right order`);
             return p1-p2;
        };
        if (p1 instanceof Array && p2 instanceof Array) {
            const p1len = p1.length; let p2len = p2.length;
            let ind = 0;

            while (result == 0) {
                if (ind === p1len && p1len !== p2len) { console.log(`${spacing}- Left side ran out of items, so inputs are in the right order`); result = -1; break; }
                if (ind === p1len) { break; }
                if (ind === p2len) { console.log(`${spacing}- Right side ran out of items, so inputs are not in the right order`); result = 1; break; }

                if (typeof p1[ind] === typeof p2[ind]) {
                    result = this._evaluate(p1[ind], p2[ind], spacing+'  ');
                    ind++;
                } else {
                    // fix inputs and retry
                    console.log(`${spacing}- fixing array/number mismatch ${typeof p1[ind]} vs ${typeof p2[ind]}`);
                    if (typeof p1[ind] === 'number') p1[ind] = [p1[ind]];
                    else                             p2[ind] = [p2[ind]];
                }
            }
        } else {
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Bad inputs', p1, p2);
        }
        return result;
    }

    getResult() {
        return this.result;
    }
}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    if (line.length) c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});