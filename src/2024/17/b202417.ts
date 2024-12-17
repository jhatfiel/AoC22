import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

function toOct(n: bigint, bits: number): string {
    let str = n.toString(2).padStart(bits);
    return str.split('').map((ch,ind)=>(bits-ind-1)%3===0 && ind !== bits-1?ch+' ':ch).join('');
}


class TBC {
    ip = 0;
    out: number[] = [];

    constructor(public mem: number[], public reg: bigint[]) {
    }

    halted(): boolean {
        let different = this.out.length > this.mem.length || this.out.some((v, ind) => this.mem[ind] !== v);
        different = false;
        return different || (this.ip < 0 || this.ip >= this.mem.length-1);
    }

    combo(operand: number): bigint {
        if (operand < 0 || operand >= 7) throw new Error(`Operand (${operand}) out of range!`);
        if (operand < 4) return BigInt(operand);
        else return this.reg[operand-4];
    }

    step() {
        if (this.halted()) return;
        let step = 2;

        let opcode = this.mem[this.ip];
        let operand = this.mem[this.ip+1];

        switch (opcode) {
            case 0: // adv (division)
                this.reg[0] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
            case 1: // bxl
                this.reg[1] = this.reg[1] ^ BigInt(operand);
                break;
            case 2: // bst
                this.reg[1] = this.combo(operand) % 8n;
                break;
            case 3: // jnz
                if (this.reg[0]) { step = 0; this.ip = operand; }
                break;
            case 4: // bxc
                this.reg[1] = this.reg[1] ^ this.reg[2];
                break;
            case 5: // out
                this.out.push(Number(this.combo(operand)%8n));
                // also log data
                break;
            case 6: // bdv
                this.reg[1] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
            case 7: // cdv
                this.reg[2] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
        }

        //console.log(`A=${toOct(this.reg[0],3)} B=${toOct(this.reg[1],3)} C=${toOct(this.reg[2],3)}`);
        this.ip += step;
    }

    debug() {
        console.log(`IP: ${this.ip} opcode: ${this.mem[this.ip]}, operand=${this.mem[this.ip+1]}`);
        console.log(`Registers: ${this.reg}`);
    }
}

export class b202417 extends AoCPuzzle {
    tbc: TBC;
    inputs = [0n];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let reg = [0n,0n,0n];
        reg[0] = BigInt(lines[0].match(/\d+/)[0]);
        reg[1] = BigInt(lines[1].match(/\d+/)[0]);
        reg[2] = BigInt(lines[2].match(/\d+/)[0]);
        let mem = [...lines[4].matchAll(/\d+/g)].map(Number);
        this.tbc = new TBC(mem, reg);
        this.log(`Memory: ${mem}`);
    }

    // SAMPLE2
    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.tbc.mem.length;
        let octetNum = this.tbc.mem.length-this.stepNumber;
        let targetNum = this.tbc.mem[octetNum];
        let targetPos = this.tbc.mem.length - this.stepNumber;
        targetPos = -1*this.stepNumber;
        this.log(`Step: ${this.stepNumber} octetNum=${octetNum} target=${targetNum} at ${targetPos}, ${this.inputs.length} potentials`);
        let found: bigint[] = [];
        let i = 0;
        while (i < 8) {
            for (let baseInput of this.inputs) {
                let input = baseInput + (BigInt(i)<<(3n*BigInt(octetNum)));
                this.tbc.ip = 0;
                this.tbc.reg = [input,0n,0n];
                this.tbc.out = [];
                while (!this.tbc.halted()) this.tbc.step();
                //this.log(`(${input.toString(2).padStart(48)}): ${this.tbc.out.length} = ${this.tbc.out}`);
                //this.log(`(${toOct(input, 48)}): ${this.tbc.out.length} = ${this.tbc.out}`);
                if (this.tbc.out.at(targetPos) === targetNum) {
                    found.push(input);
                }
            }
            i++;
        }
        if (found.length > 0) this.inputs = found;
        else throw new Error(`We've run out of potential inputs!`);

        if (!moreToDo) {
            let input = this.inputs.reduce((min,n) => min===undefined||n<min?n:min);
            this.tbc.ip = 0;
            this.tbc.reg = [input,0n,0n];
            this.tbc.out = [];
            while (!this.tbc.halted()) this.tbc.step();
            this.log(`Final input: ${input}`);
            this.log(`Memory: ${this.tbc.mem}`);
            this.log(`Output: ${this.tbc.out}`)
            this.result = input.toString();
        }
        return moreToDo;
    }
}