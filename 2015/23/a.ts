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
            this.IP++;
            i.execute();
        }
    }
}

abstract class Instruction {
    constructor(protected cpu: CPU) { }
    abstract execute(): void;
}

class HalfI extends Instruction {
    constructor(cpu: CPU, public reg: string) { super(cpu); }
    execute() {
        debug(`HalfI ${this.reg}`);
        this.cpu.reg.set(this.reg, Math.floor(this.cpu.reg.get(this.reg)! / 2));
    }
}
class TripleI extends Instruction {
    constructor(cpu: CPU, public reg: string) { super(cpu); }
    execute() {
        debug(`TripleI ${this.reg}`);
        this.cpu.reg.set(this.reg, this.cpu.reg.get(this.reg)! * 3);
    }
}
class IncI extends Instruction {
    constructor(cpu: CPU, public reg: string) { super(cpu); }
    execute() {
        debug(`IncI ${this.reg}`);
        this.cpu.reg.set(this.reg, this.cpu.reg.get(this.reg)! + 1);
    }
}
class JmpI extends Instruction {
    constructor(cpu: CPU, public offset: number) { super(cpu); }
    execute() {
        debug(`JmpI ${this.offset}`);
        this.cpu.IP = this.cpu.IP + this.offset-1;
    }
}
class JieI extends Instruction {
    constructor(cpu: CPU, public reg: string, public offset: number) { super(cpu); }
    execute() {
        debug(`JieI ${this.reg} ${this.offset}`);
        if (this.cpu.reg.get(this.reg)!%2 === 0) this.cpu.IP = this.cpu.IP + this.offset-1;
    }
}
class JioI extends Instruction {
    constructor(cpu: CPU, public reg: string, public offset: number) { super(cpu); }
    execute() {
        debug(`JioI ${this.reg} ${this.offset}`);
        if (this.cpu.reg.get(this.reg) === 1) this.cpu.IP = this.cpu.IP + this.offset-1;
    }
}

let theCPU = new CPU();

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    console.log(arr);
    let i: Instruction | undefined;

    if (arr[0] === 'hlf') { i = new HalfI(theCPU, arr[1]); }
    if (arr[0] === 'tpl') { i = new TripleI(theCPU, arr[1]); }
    if (arr[0] === 'inc') { i = new IncI(theCPU, arr[1]); }
    if (arr[0] === 'jmp') { i = new JmpI(theCPU, Number(arr[1])); }
    if (arr[0] === 'jie') { i = new JieI(theCPU, arr[1], Number(arr[2])); }
    if (arr[0] === 'jio') { i = new JioI(theCPU, arr[1], Number(arr[2])); }

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