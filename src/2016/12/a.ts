import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor() { this.reg.set('a', 0); this.reg.set('b', 0); this.reg.set('c', 1); this.reg.set('d', 0);}
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();

    run() {
        while (this.IP >= 0 && this.IP < this.instructions.length) {
            const i = this.instructions[this.IP];
            let offset = i.execute(this.reg) ?? 1;
            this.IP += offset;

            this.debug();
        }
    }

    debug(force=false) {
        debug(`IP: ${this.IP}`, false);
        debug(`reg A = ${this.reg.get('a')}`, force);
        debug(`reg B = ${this.reg.get('b')}`, force);
        debug(`reg C = ${this.reg.get('c')}`, force);
        debug(`reg D = ${this.reg.get('d')}`, force);
    }
}

abstract class Instruction {
    constructor() { }
    abstract execute(reg: Map<string, number>): number|undefined;
}

class CpyI extends Instruction {
    constructor(public regFrom: string, public regTo: string) { super(); }
    execute(reg: Map<string, number>) {
        debug(`CpyI ${this.regFrom} ${this.regTo}`);
        let value = 0;
        if (Number.isInteger(Number(this.regFrom))) value = Number(this.regFrom);
        else value = reg.get(this.regFrom)!;
        reg.set(this.regTo, value);
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
class DecI extends Instruction {
    constructor(public reg: string) { super(); }
    execute(reg: Map<string, number>) {
        debug(`DecI ${this.reg}`);
        reg.set(this.reg, reg.get(this.reg)! - 1);
        return undefined;
    }
}
class JnzI extends Instruction {
    constructor(public reg: string, public offset: number) { super(); }
    execute(reg: Map<string, number>) {
        debug(`JnzI ${this.reg} ${this.offset}`);
        let value = 0;
        if (Number.isInteger(Number(this.reg))) value = Number(this.reg);
        else value = reg.get(this.reg)!;
        if (value !== 0) return this.offset;
        return undefined;
    }
}

let theCPU = new CPU();

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    let i: Instruction | undefined;

    if (arr[0] === 'cpy') { i = new CpyI(arr[1], arr[2]); }
    if (arr[0] === 'inc') { i = new IncI(arr[1]); }
    if (arr[0] === 'dec') { i = new DecI(arr[1]); }
    if (arr[0] === 'jnz') { i = new JnzI(arr[1], Number(arr[2])); }

    if (i === undefined) throw new Error('Why you not give me good instruction???');

    theCPU.instructions.push(i);
};

p.onClose = () => {
    theCPU.run();
    theCPU.debug(true);
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) console.log(msg);
}

p.run();