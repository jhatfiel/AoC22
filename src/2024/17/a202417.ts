import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

class TBC {
    ip = 0;
    out: number[] = [];

    constructor(public mem: number[], public reg: number[]) {
    }

    halted(): boolean { return this.ip < 0 || this.ip >= this.mem.length-1; }

    combo(operand: number): number {
        if (operand < 0 || operand >= 7) throw new Error(`Operand (${operand}) out of range!`);
        if (operand < 4) return operand;
        else return this.reg[operand-4];
    }

    step() {
        if (this.halted()) return;
        let step = 2;

        let opcode = this.mem[this.ip];
        let operand = this.mem[this.ip+1];

        switch (opcode) {
            case 0: // adv (division)
                this.reg[0] = Math.trunc(this.reg[0]/(2**this.combo(operand)));
                break;
            case 1: // bxl
                this.reg[1] = this.reg[1] ^ operand;
                break;
            case 2: // bst
                this.reg[1] = this.combo(operand) % 8;
                break;
            case 3: // jnz
                if (this.reg[0]) { step = 0; this.ip = operand; }
                break;
            case 4: // bxc
                this.reg[1] = this.reg[1] ^ this.reg[2];
                break;
            case 5: // out
                this.out.push(this.combo(operand)%8);
                break;
            case 6: // bdv
                this.reg[1] = Math.trunc(this.reg[0]/(2**this.combo(operand)));
                break;
            case 7: // cdv
                this.reg[2] = Math.trunc(this.reg[0]/(2**this.combo(operand)));
                break;
        }

        this.ip += step;
    }

    debug() {
        console.log(`IP: ${this.ip} opcode: ${this.mem[this.ip]}, operand=${this.mem[this.ip+1]}`);
        console.log(`Registers: ${this.reg}`);
    }
}

export class a202417 extends AoCPuzzle {
    tbc: TBC;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let reg = [0,0,0];
        reg[0] = Number(lines[0].match(/\d+/)[0]);
        reg[1] = Number(lines[1].match(/\d+/)[0]);
        reg[2] = Number(lines[2].match(/\d+/)[0]);
        let mem = [...lines[4].matchAll(/\d+/g)].map(Number);
        this.tbc = new TBC(mem, reg);
        //console.log(`Memory: ${mem}`);
    }

    _runStep(): boolean {
        let moreToDo = !this.tbc.halted();

        if (moreToDo) {
            //this.tbc.debug();
            this.tbc.step();
        } else {
            this.result = this.tbc.out.join(',');
        }
        return moreToDo;
    }
}