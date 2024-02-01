import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class Instruction {
    constructor(public i: string, public a: number, public b: number, public c: number) {}
    execute(reg: number[]): number[] {
        let result = [...reg];
        switch (this.i) {
            case 'addr': result[this.c] = reg[this.a] + reg[this.b]; break;
            case 'addi': result[this.c] = reg[this.a] + this.b; break;
            case 'mulr': result[this.c] = reg[this.a] * reg[this.b]; break;
            case 'muli': result[this.c] = reg[this.a] * this.b; break;
            case 'banr': result[this.c] = reg[this.a] & reg[this.b]; break;
            case 'bani': result[this.c] = reg[this.a] & this.b; break;
            case 'borr': result[this.c] = reg[this.a] | reg[this.b]; break;
            case 'bori': result[this.c] = reg[this.a] | this.b; break;
            case 'setr': result[this.c] = reg[this.a]; break;
            case 'seti': result[this.c] = this.a; break;
            case 'gtir': result[this.c] = (this.a > reg[this.b])?1:0; break;
            case 'gtri': result[this.c] = (reg[this.a] > this.b)?1:0; break;
            case 'gtrr': result[this.c] = (reg[this.a] > reg[this.b])?1:0; break;
            case 'eqir': result[this.c] = (this.a === reg[this.b])?1:0; break;
            case 'eqri': result[this.c] = (reg[this.a] === this.b)?1:0; break;
            case 'eqrr': result[this.c] = (reg[this.a] === reg[this.b])?1:0; break;
            default:
                throw new Error(`Unknown instruction code specified: ${this.i}`);
                break;
        }
        return result;
    };

    toString() { return `${this.i} ${this.a.toString().padStart(3, ' ')} ${this.b.toString().padStart(3, ' ')} ${this.c.toString().padStart(3, ' ')}`; }
}

export class a201819 extends AoCPuzzle {
    IP_REG = 0;
    ip = 0;
    instructions: Array<Instruction>;
    reg = [0, 0, 0, 0, 0, 0];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.IP_REG = Number(lines[0].split(' ')[1]);
        this.instructions = lines.slice(1).map(line => {
            let arr = line.split(' ');
            return new Instruction(arr[0], Number(arr[1]), Number(arr[2]), Number(arr[3]));
        });
    }

    _runStep(): boolean {
        let moreToDo = false;
        /*
        if (this.ip >= 0 && this.ip < this.instructions.length) {
            if (this.ip === 7) this.log(`Adding ${this.reg[5]} to R0`);
            moreToDo = true;
            let instr = this.instructions[this.ip];
            this.reg[this.IP_REG] = this.ip;
            let newReg = instr.execute(this.reg);
            let jmp = '';
            if (newReg[this.IP_REG] !== this.ip) jmp = 'JUMP';
            //this.log(`ip=${this.ip.toString().padStart(2, ' ')} [${this.reg.map(r => r.toString().padStart(4, ' ')).join(', ')}] ${instr.toString()} [${newReg.map(r => r.toString().padStart(4, ' ')).join(', ')}] ${jmp}`);
            this.reg = newReg;
            this.ip = this.reg[this.IP_REG];

            this.ip++;
        }
        this.result = this.reg[0].toString();
        */

        let p1Num = 930;
        let p2Num = 10551330;
        this.log(`Part 1: ${this.sum(this.factors(p1Num))}`);
        this.result = this.sum(this.factors(p2Num)).toString();
        this.log(`Part 2: ${this.result}`);

        return moreToDo;
    }

    factors(n: number): number[] {
        let result = new Set<number>();
        Array.from({length: Math.floor(Math.sqrt(n))}, (_, i) => i).filter(i => n%i===0).forEach(i => { result.add(i); result.add(n/i); });
        return Array.from(result.keys()).sort((a,b) => a-b);
    }

    sum(arr: number[]): number {
        return arr.reduce((acc, n) => acc+=n, 0);
    }
}