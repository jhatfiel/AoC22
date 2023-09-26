import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class CPU {
    // 1! = 1
    // 2! = 2
    // 3! = 6
    // 4! = 24
    // 5! = 120
    // 6! = 720
    // 7! = 5040
    // 8! = 40320
    // 5  =>    DNF
    // 6  =>    9365  .266s
    // 7  =>   13685  .271s
    // 8  =>   48965  .9s 8! = 40320, 7! = 5040
    // 9  =>  371525  6s
    // 10 => 3637445 60s
    // 11 => 
    // 6
    //   6/  6/  0/  0 b--, move a->d
    //   0/  5/  0/  6 count down through d*b, result ends up in a
    //  30/  5/  0/  0 b--, move a->d
    //   0/  4/  0/ 30 count down through d*b, result ends up in a
    // 120/  4/  0/  0 b--, move a->d
    //   0/  3/  0/120 count down through d*b, result ends up in a
    // 360/  3/  0/  0 b--, move a->d
    //   0/  2/  0/360 count down through d*b, result ends up in a
    // 720/  2/  0/  0 b--, move a->d
    //   0/  1/  0/720 (6+7)*720 + 6-1
    // so, general result is: (2x+1)*x! + x - 1?  Nope.
    // 6: 6!=      720 * 13 = 9,360 + 5 = 9,365  720*6=4320, 360*5=1800, 180*4=720, 90*3=270, 45*2=90
    // 7: 7!=    5,040 * 15 = 
    // 8: 8!=   40,320
    // 9: 9!=  362,880
    //10:10!=3,628,800
    //11:11!=11*10! = 39925445
    //12:12!=12*11! = 479010245

    constructor() { this.reg.set('a', 12*11*3628800/*12*/); this.reg.set('b', 1); this.reg.set('c', 0); this.reg.set('d', 0);}
    reg = new Map<string, number>();
    IP = 11;
    instructions = new Array<Instruction>();

    run() {
        while (this.IP >= 0 && this.IP < this.instructions.length) {
            const i = this.instructions[this.IP];
            let offset = i.execute(this.setReg.bind(this), this.setInstruction.bind(this)) ?? 1;
            this.IP += offset;

            //if (this.reg.get('a') === 0 || this.reg.get('b') === 0 || this.reg.get('c') === 0) this.debug(false, true);
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
}

abstract class Instruction {
    constructor() { }
    abstract execute(setReg: (name: string, value: number) => number, setInstruction: (offset: number, i?: Instruction) => Instruction): number|undefined;
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
        } else if (originalInstruction instanceof DecI || originalInstruction instanceof TglI) {
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

let theCPU = new CPU();

p.onLine = (line) => {
    const arr = line.replace(',', '').split(' ');
    let i: Instruction | undefined;

    if (arr[0] === 'cpy') { i = new CpyI(arr[1], arr[2]); }
    if (arr[0] === 'inc') { i = new IncI(arr[1]); }
    if (arr[0] === 'dec') { i = new DecI(arr[1]); }
    if (arr[0] === 'jnz') { i = new JnzI(arr[1], arr[2]); }
    if (arr[0] === 'tgl') { i = new TglI(arr[1]); }

    if (i === undefined) throw new Error('Why you not give me good instruction???');

    theCPU.instructions.push(i);
};

p.onClose = () => {
    theCPU.run();
    theCPU.debug(false, true);
    // 42 is not correct
};

function debug(msg: string, force=false) {
    //force=true;
    if (force) {
        if (process.stdout.clearLine) process.stdout.clearLine(0);
        console.log(msg);
    }
}

p.run();