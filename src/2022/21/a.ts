import { createReadStream } from "fs";
import { createInterface } from "readline";

class Monkey {
    constructor(public name: string) {}
    value?: number;
    getValue(): number {
        if (this.value === undefined) throw new Error(`[${this.name}] Bare value monkey doesn't know his value`);
        return this.value;
    };
}

abstract class MonkeyMath extends Monkey {
    constructor(public name: string, public resolver: (name: string) => Monkey, public op1: string, public op2: string) { super(name); }
    getValue(): number {
        console.log(`[${this.name}] COMPUTE ${this.op1} and ${this.op2}`);
        if (this.value === undefined) {
            this.value = this.compute(this.resolver(this.op1).getValue(), this.resolver(this.op2).getValue());
        }

        return this.value;
    }
    abstract compute(n1: number, n2: number): number;
}

class MonkeySum extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 + n2; }
} 

class MonkeyDiff extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 - n2; }
} 

class MonkeyProduct extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 * n2; }
} 

class MonkeyDiv extends MonkeyMath {
    compute(n1: number, n2: number): number { return n1 / n2; }
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
            console.log(`[${name}]: found formula ${op} ${op1} ${op2}`);
            let monkey: Monkey;
            if      (op === '+') monkey = new MonkeySum    (name, this.getMonkey.bind(this), op1, op2);
            else if (op === '-') monkey = new MonkeyDiff   (name, this.getMonkey.bind(this), op1, op2);
            else if (op === '*') monkey = new MonkeyProduct(name, this.getMonkey.bind(this), op1, op2);
            else if (op === '/') monkey = new MonkeyDiv    (name, this.getMonkey.bind(this), op1, op2);
            this.monkeys.set(name, monkey!);
        } else {
            let value = Number(formula);
            console.log(`[${name}]: found value ${value}`);
            let monkey = new Monkey(name);
            monkey.value = value;
            this.monkeys.set(name, monkey);
        }
    }

    getResult() {
        let result = 1;
        console.log();
        let rootMonkey = this.monkeys.get('root');
        if (rootMonkey) result = rootMonkey.getValue();
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
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});