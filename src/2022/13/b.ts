import { createReadStream } from "fs";
import { createInterface } from "readline";

class C {
    pair = 1;
    packets = new Array<Array<any>>();
    process(line: string) {
        this.packets.push(this.handle(line));
    }

    handle(line: string): Array<any> { return eval(line); }

    _evaluate(p1: any, p2: any): number {
        let result = 0;
        if (typeof p1 === 'number' && typeof p2 === 'number') { return p1-p2; };
        if (p1 instanceof Array && p2 instanceof Array) {
            const p1len = p1.length; let p2len = p2.length;
            let ind = 0;

            while (result == 0) {
                if (ind === p1len && p1len !== p2len) { result = -1; break; }
                if (ind === p1len) { break; }
                if (ind === p2len) { result = 1; break; }

                if (typeof p1[ind] === typeof p2[ind]) {
                    result = this._evaluate(p1[ind], p2[ind]);
                    ind++;
                } else {
                    // fix inputs and retry
                    // so, this is a bug - it modifies the original value.
                    // But I don't really care to fix it - probably could just shallow copy and that would take care of it
                    // impact is seen in getResult() - because the key packets have been modified
                    if (typeof p1[ind] === 'number') p1[ind] = [p1[ind]];
                    else                             p2[ind] = [p2[ind]];
                }
            }
        } else {
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Bad inputs', p1, p2);
        }
        return result;
    }

    debug() {
        this.packets.forEach((p, ind) => {
            console.log(`${ind.toString().padStart(2)}: ${JSON.stringify(p)}`);
        })

    }

    getResult() {
        let result = 0;
        c.packets.forEach((p, ind) => {
            if (JSON.stringify(p) === '[ [ [ [ 2 ] ] ] ]') result = ind+1;
            if (JSON.stringify(p) === '[ [ [ [ 6 ] ] ] ]') result *= ind+1;
        });
        return result;
    }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    if (line.length) c.process(line);
})

rl.on('close', () => {
    c.process('[[2]]');
    c.process('[[6]]');
    c.packets = c.packets.sort(c._evaluate.bind(c));
    c.debug();
    console.log(`Result: ${c.getResult()}`);
});