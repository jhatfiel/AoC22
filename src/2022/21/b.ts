import fs from 'fs';
import readline from 'readline';

class Monkey {
    constructor(public name: string) {}
    value?: number;
    getValue(): number|undefined {
        return this.value;
    };
    solve(n: number): number { return n; }

}

abstract class MonkeyMath extends Monkey {
    constructor(public name: string, public resolver: (name: string) => Monkey, public op1: string, public op2: string) { super(name); }
    getValue(): number|undefined {
        console.log(`[${this.name}]: COMPUTE ${this.op1} and ${this.op2}`);
        if (this.value === undefined) {
            let m1v = this.resolver(this.op1).getValue();
            let m2v = this.resolver(this.op2).getValue();
            if (m1v !== undefined && m2v !== undefined) this.value = this.compute(m1v, m2v);
        }

        return this.value;
    }
    abstract compute(n1: number, n2: number): number;
}

class MonkeySum extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 + n2; }
    solve(n: number): number  {
            let m1 = this.resolver(this.op1);
            let m1v = m1.getValue();
            let m2 = this.resolver(this.op2);
            let m2v = m2.getValue();
            if (m1v === undefined && m2v !== undefined) { return m1.solve(n - m2v); }
            if (m1v !== undefined && m2v === undefined) { return m2.solve(n - m1v); }
            throw new Error(`[${this.name}]: SUM SOLVE called, but couldn't - [${this.op1}]=[${m1v}] and [${this.op2}]=[${m2v}]`);
    }
} 

class MonkeyDiff extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 - n2; }
    solve(n: number): number  {
            let m1 = this.resolver(this.op1);
            let m1v = m1.getValue();
            let m2 = this.resolver(this.op2);
            let m2v = m2.getValue();
            if (m1v === undefined && m2v !== undefined) { return m1.solve(n + m2v); }
            if (m1v !== undefined && m2v === undefined) { return m2.solve(m1v - n); }
            throw new Error(`[${this.name}]: DIFF SOLVE called, but couldn't - [${this.op1}]=[${m1v}] and [${this.op2}]=[${m2v}]`);
    }
} 

class MonkeyProduct extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 * n2; }
    solve(n: number): number  {
            let m1 = this.resolver(this.op1);
            let m1v = m1.getValue();
            let m2 = this.resolver(this.op2);
            let m2v = m2.getValue();
            if (m1v === undefined && m2v !== undefined) { return m1.solve(n / m2v); }
            if (m1v !== undefined && m2v === undefined) { return m2.solve(n / m1v); }
            throw new Error(`[${this.name}]: PRODUCT SOLVE called, but couldn't - [${this.op1}]=[${m1v}] and [${this.op2}]=[${m2v}]`);
    }
} 

class MonkeyDiv extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 / n2; }
    solve(n: number): number  {
            // n = 1/2
            // 2n = 1
            // 2 = 1/n
            let m1 = this.resolver(this.op1);
            let m1v = m1.getValue();
            let m2 = this.resolver(this.op2);
            let m2v = m2.getValue();
            if (m1v === undefined && m2v !== undefined) { return m1.solve(n * m2v); }
            if (m1v !== undefined && m2v === undefined) { return m2.solve(m1v / n); }
            throw new Error(`[${this.name}]: DIV SOLVE called, but couldn't - [${this.op1}]=[${m1v}] and [${this.op2}]=[${m2v}]`);
    }
} 

class C {
    constructor() { }

    monkeys = new Map<string, Monkey>();

    process(line: string) {
        console.log(`line: ${line}`);
        let [name, formula] = line.split(':');
        if (formula.length === 12) {
            let op1 = formula.substring(1,5);
            let op2 = formula.substring(8);
            let op = formula.substring(6,7);
            let monkey: Monkey;
            if      (op === '+') monkey = new MonkeySum    (name, this.getMonkey.bind(this), op1, op2);
            else if (op === '-') monkey = new MonkeyDiff   (name, this.getMonkey.bind(this), op1, op2);
            else if (op === '*') monkey = new MonkeyProduct(name, this.getMonkey.bind(this), op1, op2);
            else if (op === '/') monkey = new MonkeyDiv    (name, this.getMonkey.bind(this), op1, op2);
            this.monkeys.set(name, monkey!);
        } else {
            let value = Number(formula);
            let monkey = new Monkey(name);
            if (name !== 'humn') monkey.value = value;
            this.monkeys.set(name, monkey);
        }
    }

    getResult() {
        let result = 1;
        console.log();
        let rootMonkey = this.getMonkey('root') as MonkeyMath;

        if (rootMonkey) {
            let m1 = this.getMonkey(rootMonkey.op1);
            let m1v = m1.getValue();
            let m2 = this.getMonkey(rootMonkey.op2);
            let m2v = m2.getValue();
            console.log(`m1v(${m1.name})=${m1v} m2v(${m2.name})=${m2v}`);
            if (m1v === undefined && m2v !== undefined) result = m1.solve(m2v);
            else if (m1v !== undefined)                 result = m2.solve(m1v);
        }
        return result;
    }

    getMonkey(name: string): Monkey {
        let monkey = this.monkeys.get(name);
        if (monkey === undefined) throw new Error(`[${name}] not found`);
        return monkey;
    }

    debug() {
    }
}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});