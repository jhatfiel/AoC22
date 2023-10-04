import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    constructor(public id: number, public pair: CPU) {
        this.reg.set('a', 0);
        this.reg.set('p', id);
        this.cpuAccessor = new CPUAccessor(this);
    }
    cpuAccessor: CPUAccessor;
    reg = new Map<string, number>();
    IP = 0;
    instructions = new Array<Instruction>();
    buffer = new Array<number>();
    sendCount = 0;
    mulCount = 0;
    lineExecCount = new Map<number, number>();

    run(forceDebug = false) {
        this.instructions.forEach((_, ind) => this.lineExecCount.set(ind, 0));
        
        while (this.IP >= 0 && this.IP < this.instructions.length) {
            this.lineExecCount.set(this.IP, this.lineExecCount.get(this.IP)+1);
            //if (this.IP === 8) this.debug(false, true);
            //this.debug(true, true);
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
        debug(` a: ${this.reg.get('a')}`, force);
        debug(` b: ${this.reg.get('b')}`, force);
        debug(` c: ${this.reg.get('c')}`, force);
        debug(` d: ${this.reg.get('d')}`, force);
        debug(` e: ${this.reg.get('e')}`, force);
        debug(` f: ${this.reg.get('f')}`, force);
        debug(` g: ${this.reg.get('g')}`, force);
        debug(` h: ${this.reg.get('h')}`, force);
        let lines = -9;
        /*
        this.instructions.forEach((i, ind) => {
            debug(`${ind===this.IP?'>':' '}[${this.lineExecCount.get(ind).toString().padStart(8, ' ')}]: ${i.debugStr()}`, force);
            lines--;
        })
        */
        if (clear && process.stdout.moveCursor) process.stdout.moveCursor(0 ,lines)
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
    increaseMulCount() {
        this.cpu.mulCount++;
    }
}

abstract class Instruction {
    constructor(public reg1='', public reg2='') {}
    abstract execute(ca: CPUAccessor, forceDebug: boolean): number|undefined;
    debug(force: boolean) { debug(this.debugStr(), force) };
    abstract debugStr();
}
class SndI extends Instruction {
    debugStr() { return `SndI ${this.reg1}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.send(ca.setReg(this.reg1));
        return undefined;
    }
}
class SetI extends Instruction {
    debugStr() { return `SetI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg2));
        return undefined;
    }
}
class AddI extends Instruction {
    debugStr() { return `AddI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) + ca.setReg(this.reg2));
        return undefined;
    }
}
class SubI extends Instruction {
    debugStr() { return `SubI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) - ca.setReg(this.reg2));
        return undefined;
    }
}
class MulI extends Instruction {
    debugStr() { return `MulI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) * ca.setReg(this.reg2));
        ca.increaseMulCount();
        return undefined;
    }
}
class ModI extends Instruction {
    debugStr() { return `ModI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        ca.setReg(this.reg1, ca.setReg(this.reg1) % ca.setReg(this.reg2));
        return undefined;
    }
}
class RcvI extends Instruction {
    debugStr() { return `RcvI ${this.reg1}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        throw new Error('RcvI should never execute');
        return undefined;
    }
}
class JgzI extends Instruction {
    debugStr() { return `JgzI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        let value = ca.setReg(this.reg1);
        let offset = ca.setReg(this.reg2);
        if (value > 0) return offset;
        return undefined;
    }
}
class JnzI extends Instruction {
    debugStr() { return `JnzI ${this.reg1} ${this.reg2}`; }
    execute(ca: CPUAccessor, forceDebug: boolean) {
        this.debug(forceDebug);
        let value = ca.setReg(this.reg1);
        let offset = ca.setReg(this.reg2);
        if (value !== 0) return offset;
        return undefined;
    }
}

let cpu0: CPU;
cpu0 = new CPU(0, undefined);

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    let i: Instruction | undefined;

    if (arr[0] === 'set') { i = new SetI(arr[1], arr[2]); }
    if (arr[0] === 'snd') { i = new SndI(arr[1]); }
    if (arr[0] === 'add') { i = new AddI(arr[1], arr[2]); }
    if (arr[0] === 'sub') { i = new SubI(arr[1], arr[2]); }
    if (arr[0] === 'mul') { i = new MulI(arr[1], arr[2]); }
    if (arr[0] === 'mod') { i = new ModI(arr[1], arr[2]); }
    if (arr[0] === 'rcv') { i = new RcvI(arr[1]); }
    if (arr[0] === 'jgz') { i = new JgzI(arr[1], arr[2]); }
    if (arr[0] === 'jnz') { i = new JnzI(arr[1], arr[2]); }

    if (i === undefined) throw new Error(`Why you not give me good instruction??? ${line}`);

    cpu0.instructions.push(i);
};

p.onClose = () => {
    cpu0.run();
    cpu0.debug(false, true);
    console.log(`mul count = ${cpu0.mulCount}`);
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) {
        if (process.stdout.clearLine) process.stdout.clearLine(0);
        console.log(msg);
    }
}

p.run();

// part 2 is the number of composites between 108400 and 125400 (inclusive) when skipping by 17
let h=0;
for (let b=108400; b<=125400; b+=17) {
	let f=1
	for (let d=2; d<=Math.sqrt(b) && f===1; d++) {
        if (b%d === 0) f=0
	}
	if (f==0) h++;
}
console.log(h);
