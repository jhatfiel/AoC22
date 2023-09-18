import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor() { this.reg.set('a', 0); this.reg.set('b', 0); }
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();

    run() {
        while (this.IP >= 0 && this.IP < this.instructions.length) {
            const i = this.instructions[this.IP];
            let offset = i.execute(this.reg) ?? 1;
            this.IP += offset;
        }
    }
}

abstract class Instruction {
    constructor() { }
    abstract execute(reg: Map<string, number>): number|undefined;
}

class HalfI extends Instruction {
    constructor(public reg: string) { super(); }
    execute(reg: Map<string, number>) {
        debug(`HalfI ${this.reg}`);
        reg.set(this.reg, Math.floor(reg.get(this.reg)! / 2));
        return undefined;
    }
}
class TripleI extends Instruction {
    constructor(public reg: string) { super(); }
    execute(reg: Map<string, number>) {
        debug(`TripleI ${this.reg}`);
        reg.set(this.reg, reg.get(this.reg)! * 3);
        return undefined;
    }
}
class IncI extends Instruction {
    constructor(public reg: string) { super(); }
    execute(reg: Map<string, number>) {
        debug(`IncI ${this.reg}`);
        reg.set(this.reg, reg.get(this.reg)! + 1);
        return undefined;
    }
}
class JmpI extends Instruction {
    constructor(public offset: number) { super(); }
    execute() {
        debug(`JmpI ${this.offset}`);
        return this.offset;
    }
}
class JieI extends Instruction {
    constructor(public reg: string, public offset: number) { super(); }
    execute(reg: Map<string, number>) {
        debug(`JieI ${this.reg} ${this.offset}`);
        if (reg.get(this.reg)!%2 === 0) return this.offset;
        return undefined;
    }
}
class JioI extends Instruction {
    constructor(public reg: string, public offset: number) { super(); }
    execute(reg: Map<string, number>) {
        debug(`JioI ${this.reg} ${this.offset}`);
        if (reg.get(this.reg) === 1) return this.offset;
        return undefined;
    }
}

let theCPU = new CPU();

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    console.log(arr);
    let i: Instruction | undefined;

    if (arr[0] === 'hlf') { i = new HalfI(arr[1]); }
    if (arr[0] === 'tpl') { i = new TripleI(arr[1]); }
    if (arr[0] === 'inc') { i = new IncI(arr[1]); }
    if (arr[0] === 'jmp') { i = new JmpI(Number(arr[1])); }
    if (arr[0] === 'jie') { i = new JieI(arr[1], Number(arr[2])); }
    if (arr[0] === 'jio') { i = new JioI(arr[1], Number(arr[2])); }

    if (i === undefined) throw new Error('Why you not give me good instruction???');

    theCPU.instructions.push(i);
};

p.onClose = () => {
    theCPU.run();
    console.log(`reg A = ${theCPU.reg.get('a')}`)
    console.log(`reg B = ${theCPU.reg.get('b')}`)
};

function debug(msg: string) {
    console.log(msg);
}

p.run();