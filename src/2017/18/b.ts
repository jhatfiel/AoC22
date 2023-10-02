import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor(public id: number, public pair: CPU) {
        this.reg.set('p', id);
        this.cpuAccessor = new CPUAccessor(this);
    }
    cpuAccessor: CPUAccessor;
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();
    buffer = new Array<number>();
    sendCount = 0;

    run(forceDebug = false) {
        while (this.IP >= 0 && this.IP < this.instructions.length) {
            const i = this.instructions[this.IP];
            if (this.instructions[this.IP] instanceof RcvI) {
                if (this.buffer.length) {
                    let value = this.buffer.shift();
                    this.reg.set(this.instructions[this.IP].reg1, value);
                    this.IP++;
                } else { 
                    debug(`[${this.id}] ran out of buffer, returning`, true);
                    break;
                }
            } else {
                let offset = i.execute(this.cpuAccessor, forceDebug) ?? 1;
                this.IP += offset;
            }
        }
    }

    canProceed() {
        return this.buffer.length > 0 || !(this.instructions[this.IP] instanceof RcvI);
    }

    debug(clear=false, force=false) {
        debug(`IP: ${this.IP}`, force);
    }
}

class CPUAccessor {
    constructor(public cpu: CPU) {}
    setReg(name: string, value?: number) {
        if (Number.isInteger(Number(name))) return Number(name); // short circuit if register isn't a register name but is instead a number

        if (value !== undefined) this.cpu.reg.set(name, value);
        let regValue = this.cpu.reg.get(name);
        if (regValue === undefined) regValue = 0;
        return regValue;
    }
    setInstruction(offset: number, i?: Instruction) {
        if (i !== undefined) this.cpu.instructions[this.cpu.IP+offset] = i;
        return this.cpu.instructions[this.cpu.IP+offset]
    }
    send(value: number) {
        this.cpu.sendCount++;
        this.cpu.pair.buffer.push(value);
    }
}

abstract class Instruction {
    constructor(public reg1='', public reg2='') {}
    abstract execute(ca: CPUAccessor, forceDebug: boolean): number|undefined;
    abstract debug(force: boolean);
}
class SndI extends Instruction {
    debug(force=false) {
        debug(`SndI ${this.reg1}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.send(ca.setReg(this.reg1));
        return undefined;
    }
}
class SetI extends Instruction {
    debug(force=false) {
        debug(`SetI ${this.reg1} ${this.reg2}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg2));
        return undefined;
    }
}
class AddI extends Instruction {
    debug(force=false) {
        debug(`AddI ${this.reg1} ${this.reg2}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) + ca.setReg(this.reg2));
        return undefined;
    }
}
class MulI extends Instruction {
    debug(force=false) {
        debug(`MulI ${this.reg1} ${this.reg2}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) * ca.setReg(this.reg2));
        return undefined;
    }
}
class ModI extends Instruction {
    debug(force=false) {
        debug(`ModI ${this.reg1} ${this.reg2}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) % ca.setReg(this.reg2));
        return undefined;
    }
}
class RcvI extends Instruction {
    debug(force=false) {
        debug(`RcvI ${this.reg1}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        throw new Error('RcvI should never execute');
        return undefined;
    }
}
class JgzI extends Instruction {
    debug(force=false) {
        debug(`JgzI ${this.reg1} ${this.reg2}`, force);
    }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        let value = ca.setReg(this.reg1);
        let offset = ca.setReg(this.reg2);
        if (value > 0) return offset;
        return undefined;
    }
}

let cpu0, cpu1: CPU;
cpu0 = new CPU(0, cpu1);
cpu1 = new CPU(1, cpu0);
cpu0.pair = cpu1;

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

    cpu0.instructions.push(i);
    cpu1.instructions.push(i);
};

p.onClose = () => {
    while (cpu0.canProceed() || cpu1.canProceed()) {
        if (cpu0.canProceed()) cpu0.run();
        else cpu1.run();
    }
    console.log(`Deadlock cpu1.sendCount = ${cpu1.sendCount}`);
    // 127 is too low
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) {
        if (process.stdout.clearLine) process.stdout.clearLine(0);
        console.log(msg);
    }
}

p.run();