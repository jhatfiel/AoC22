import fs from 'fs';
import readline from 'readline';

abstract class Monkey {
    constructor(public name: string) {};

    inspected = 0;
    operation = this.add.bind(this);
    opArg = 0;
    mod = 1;
    throwTrue = NaN;
    throwFalse = NaN;

    items: Array<number> = new Array();
    inspectAll() {
        while (this.items.length) {
            var i = this.items.shift();
            if (i !== undefined) {
                //console.log(`M[${this.name}] inspecting ${i}...`);
                i = this.operation(i);
                this.inspected++;
                i = Math.floor(i/3);

                if (i % this.mod == 0) this.throw(i, this.throwTrue);
                else                   this.throw(i, this.throwFalse);
            }
        }
    }

    add(i: number): number { return i + this.opArg; }
    multiply(i: number): number { return i * this.opArg; }
    square(i: number): number { return i * i; }
    
    abstract throw(itemWorryLevel: number, toMonkey: number): void;

    debug() {
        console.log(`M[${this.name}](${this.inspected}) Items: ${this.items.join(' ')}`);
    }
}

class C {
    monkeys: Array<Monkey> = new Array();
    currentMonkey?: Monkey;

    process(line: string) {
        var parts = line.trim().split(' ');
        if (parts[0] == 'Monkey') {
            var that = this;
            this.currentMonkey = new class extends Monkey {
                throw(itemWorryLevel: number, toMonkey: number) { that.monkeyThrew(itemWorryLevel, toMonkey); }
            }(parts[1].replace(':', ''));
            this.monkeys.push(this.currentMonkey);
        } else if (this.currentMonkey && parts[0] == 'Starting') {
            this.currentMonkey.items = parts.slice(2).join('').split(',').map(Number);
        } else if (this.currentMonkey && parts[0] == 'Operation:') {
            // new = old * 19
            // new = old + 6
            // new = old * old
            // new = old + old <-- not done....
            var op   = parts[4];
            var arg2 = parts[5];
            if (op == '+') {
                this.currentMonkey.operation = this.currentMonkey.add.bind(this.currentMonkey);
                this.currentMonkey.opArg = Number(arg2);
            } else { // op == '*'
                if (arg2 == 'old') {
                    this.currentMonkey.operation = this.currentMonkey.square.bind(this.currentMonkey);
                } else {
                    this.currentMonkey.operation = this.currentMonkey.multiply.bind(this.currentMonkey);
                    this.currentMonkey.opArg = Number(arg2);
                }
            }
        } else if (this.currentMonkey && parts[0] == 'Test:') {
            this.currentMonkey.mod = Number(parts[3]);
        } else if (this.currentMonkey && parts[1] == 'true:') {
            this.currentMonkey.throwTrue = Number(parts[5]);
        } else if (this.currentMonkey && parts[1] == 'false:') {
            this.currentMonkey.throwFalse = Number(parts[5]);
        }
    }

    executeRound() {
        this.monkeys.forEach((m) => {
            this.inspect(m);
        });
    }

    inspect(m: Monkey) {
        this.currentMonkey = m;
        this.currentMonkey.inspectAll();
    }

    monkeyThrew(itemWorryLevel: number, toMonkey: number) {
        //console.log(`M[${this.currentMonkey?.name}] throwing ${itemWorryLevel} to M[${toMonkey}]`);
        this.monkeys[toMonkey].items.push(itemWorryLevel);
    }

    getResult() {
        var a = 0;
        var b = 0;
        this.monkeys.forEach((m) => {
            if (m.inspected > a) {
                b = a;
                a = m.inspected;
            } else if (m.inspected > b) {
                b = m.inspected;
            }

        });
        return a*b;
    }

    debug() {
        this.monkeys.forEach((m) => m.debug());
    }
}

var c = new C();

var fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    for (var i=0; i < 20; i++) {
        console.log(`--- ROUND ${i} ---`);
        c.debug();
        c.executeRound();
    }
    console.log('--- END ---');
    c.debug();

    console.log(`Result: ${c.getResult()}`);
});
