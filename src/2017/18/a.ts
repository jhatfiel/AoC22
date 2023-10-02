import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor() { }
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();
    output = '';

    run(forceDebug = false, maxLength = Infinity) {
        while (this.IP >= 0 && this.IP < this.instructions.length && this.output.length < maxLength) {
            const i = this.instructions[this.IP];
            let offset = i.execute(this.setReg.bind(this), this.setInstruction.bind(this), this.say.bind(this), forceDebug) ?? 1;
            this.IP += offset;
        }
    }

    setReg(name: string, value?: number): number {
        if (Number.isInteger(Number(name))) return Number(name); // short circuit if register isn't a register name but is instead a number

        if (value !== undefined) this.reg.set(name, value);
        let regValue = this.reg.get(name);
        if (regValue === undefined) regValue = 0;
        return regValue;
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
        debug(`Output: ${this.output}`, force);
        //this.instructions.forEach((i) => i.debug(force));
        //if (clear && process.stdout.moveCursor) process.stdout.moveCursor(0, -1*(5+this.instructions.length));
    }

    copy(): CPU {
        let copy = new CPU();
        copy.instructions = [...this.instructions];
        return copy;
    }
}

abstract class Instruction {
    constructor(public reg1='', public reg2='') {}
    abstract execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean): number|undefined;
    abstract debug(force: boolean);
}
class SndI extends Instruction {
    debug(force=false) {
        debug(`SndI ${this.reg1}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        say(`Playing sound: ${setReg(this.reg1)}\n`);
        return undefined;
    }
}
class SetI extends Instruction {
    debug(force=false) {
        debug(`SetI ${this.reg1} ${this.reg2}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        setReg(this.reg1, setReg(this.reg2));
        return undefined;
    }
}
class AddI extends Instruction {
    debug(force=false) {
        debug(`AddI ${this.reg1} ${this.reg2}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        setReg(this.reg1, setReg(this.reg1) + setReg(this.reg2));
        return undefined;
    }
}
class MulI extends Instruction {
    debug(force=false) {
        debug(`MulI ${this.reg1} ${this.reg2}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        setReg(this.reg1, setReg(this.reg1) * setReg(this.reg2));
        return undefined;
    }
}
class ModI extends Instruction {
    debug(force=false) {
        debug(`ModI ${this.reg1} ${this.reg2}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        setReg(this.reg1, setReg(this.reg1) % setReg(this.reg2));
        return undefined;
    }
}
class RcvI extends Instruction {
    debug(force=false) {
        debug(`RcvI ${this.reg1}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        if (setReg(this.reg1) > 0) {
            say(`RcvI called, ${this.reg1} is non zero, terminate`);
            return Infinity;
        }
        return undefined;
    }
}
class JgzI extends Instruction {
    debug(force=false) {
        debug(`JgzI ${this.reg1} ${this.reg2}`, force);
    }
    execute(setReg: (name: string, value?: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction, say: (m: string) => void, forceDebug: boolean) {
        this.debug(forceDebug);
        let value = setReg(this.reg1);
        let offset = setReg(this.reg2);
        if (value > 0) return offset;
        return undefined;
    }
}

let theCPU = new CPU();

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    let i: Instruction | undefined;

    if (arr[0] === 'set') { i = new SetI(arr[1], arr[2]); }
    if (arr[0] === 'snd') { i = new SndI(arr[1]); }
    if (arr[0] === 'add') { i = new AddI(arr[1], arr[2]); }
    if (arr[0] === 'mul') { i = new MulI(arr[1], arr[2]); }
    if (arr[0] === 'mod') { i = new ModI(arr[1], arr[2]); }
    if (arr[0] === 'rcv') { i = new RcvI(arr[1]); }
    if (arr[0] === 'jgz') { i = new JgzI(arr[1], arr[2]); }

    if (i === undefined) throw new Error('Why you not give me good instruction???');
    i.debug(true);

    theCPU.instructions.push(i);
};

p.onClose = () => {
    theCPU.run(true);
    theCPU.debug(false, true);
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) {
        if (process.stdout.clearLine) process.stdout.clearLine(0);
        console.log(msg);
    }
}

p.run();