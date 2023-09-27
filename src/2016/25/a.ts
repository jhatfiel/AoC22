import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor() { this.reg.set('a', 0); this.reg.set('b', 0); this.reg.set('c', 0); this.reg.set('d', 0);}
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();
    output = '';

    run(maxLength = Infinity) {
        while (this.IP >= 0 && this.IP < this.instructions.length && this.output.length < maxLength) {
            const i = this.instructions[this.IP];
            let offset = i.execute(this.setReg.bind(this), this.setInstruction.bind(this), this.say.bind(this)) ?? 1;
            this.IP += offset;
        }
    }

    setReg(name: string, value?: number): number {
        if (value !== undefined) this.reg.set(name, value);
        return this.reg.get(name);
    }

    setInstruction(offset: number, i?: Instruction): Instruction {
        if (i !== undefined) this.instructions[this.IP+offset] = i;
        return this.instructions[this.IP+offset]
    }

    say(s: string) {
        this.output += s;
    }

    debug(clear=false, force=false) {
        debug(``, force);
        debug(`IP: ${this.IP}`, force);
        debug(`reg A = ${this.reg.get('a')}`, force);
        debug(`reg B = ${this.reg.get('b')}`, force);
        debug(`reg C = ${this.reg.get('c')}`, force);
        debug(`reg D = ${this.reg.get('d')}`, force);
        this.instructions.forEach((i) => i.debug(force));
        
        if (clear && process.stdout.moveCursor) process.stdout.moveCursor(0, -1*(5+this.instructions.length));
    }

    copy(): CPU {
        let copy = new CPU();
        copy.instructions = [...this.instructions];
        return copy;
    }
}

abstract class Instruction {
    abstract execute(setReg: (name: string, value: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void): number|undefined;
    abstract debug(force: boolean);
}

class CpyI extends Instruction {
    constructor(public regFrom: string, public regTo: string) { super(); }
    debug(force=false) {
        debug(`CpyI ${this.regFrom} ${this.regTo}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction) {
        this.debug();
        let value = 0;
        if (Number.isInteger(Number(this.regFrom))) value = Number(this.regFrom);
        else value = setReg(this.regFrom);
        setReg(this.regTo, value);
        return undefined;
    }
}
class IncI extends Instruction {
    constructor(public reg: string) { super(); }
    debug(force=false) {
        debug(`IncI ${this.reg}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction) {
        this.debug();
        setReg(this.reg, setReg(this.reg) + 1);
        return undefined;
    }
}
class DecI extends Instruction {
    constructor(public reg: string) { super(); }
    debug(force=false) {
        debug(`DecI ${this.reg}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction) {
        this.debug();
        setReg(this.reg, setReg(this.reg) - 1);
        return undefined;
    }
}
class JnzI extends Instruction {
    constructor(public reg: string, public offset: string) { super(); }
    debug(force=false) {
        debug(`JnzI ${this.reg} ${this.offset}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction) {
        this.debug();
        let value = 0;
        if (Number.isInteger(Number(this.reg))) value = Number(this.reg);
        else value = setReg(this.reg)!;
        let offset = Number(this.offset);
        if (!Number.isInteger(offset)) offset = setReg(this.offset);
        if (value !== 0) return offset;
        return undefined;
    }
}
class TglI extends Instruction {
    constructor(public reg: string) { super(); }
    debug(force=false) {
        debug(`TglI ${this.reg}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction) {
        this.debug();
        let offset = 0;
        if (Number.isInteger(Number(this.reg))) throw new Error(`Invalid argument to Tgl: ${this.reg}`);
        else offset = setReg(this.reg)!;
        let originalInstruction = setInstruction(offset);
        let newInstruction: Instruction;
        if (originalInstruction instanceof IncI) {
            // becomes DecI
            newInstruction = new DecI(originalInstruction.reg);
        } else if (originalInstruction instanceof DecI || originalInstruction instanceof TglI || originalInstruction instanceof OutI) {
            // becomes IncI
            newInstruction = new IncI(originalInstruction.reg);
        } else if (originalInstruction instanceof JnzI) {
            // becomes CpyI
            newInstruction = new CpyI(originalInstruction.reg, originalInstruction.offset);
        } else if (originalInstruction instanceof CpyI) {
            // becomes JnzI
            newInstruction = new JnzI(originalInstruction.regFrom, originalInstruction.regTo);
        }

        if (newInstruction !== undefined) {
            setInstruction(offset, newInstruction);
        }

        return undefined;
    }
}
class OutI extends Instruction {
    constructor(public reg: string) { super(); }
    debug(force=false) {
        debug(`OutI ${this.reg}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void) {
        this.debug();
        let value = 0;
        if (Number.isInteger(Number(this.reg))) value = Number(this.reg);
        else value = setReg(this.reg)!;
        say(value.toString());
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
    if (arr[0] === 'jnz') { i = new JnzI(arr[1], arr[2]); }
    if (arr[0] === 'tgl') { i = new TglI(arr[1]); }
    if (arr[0] === 'out') { i = new OutI(arr[1]); }

    if (i === undefined) throw new Error('Why you not give me good instruction???');

    theCPU.instructions.push(i);
};

p.onClose = () => {
    let output = '';
    let counter = 0;
    while (output !== '01010101010101010101') {
        let cpuCopy = theCPU.copy();
        cpuCopy.reg.set('a', counter);
        cpuCopy.run(20);
        output = cpuCopy.output;
        console.log(`${counter.toString().padStart(3, ' ')}: ${output}`)
        counter++;
    }
    //theCPU.run();
    //theCPU.debug(false, true);
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) {
        if (process.stdout.clearLine) process.stdout.clearLine(0);
        console.log(msg);
    }
}

p.run();