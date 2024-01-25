import { AoCPuzzle } from '../../lib/AoCPuzzle';

enum InstructionCode {
    // add register,immediate
    ADDR, ADDI,
    // multiply register,immediate
    MULR, MULI,
    // bitwise and register,immediate
    BANR, BANI,
    // bitwise or register,immediate
    BORR, BORI,
    // Assignment register,immediate
    SETR, SETI,
    // Greater than immediate/register, register/immediate, register/register
    GTIR, GTRI, GTRR,
    // Equality immediate/register, register/immediate, register/register
    EQIR, EQRI, EQRR,
}
export class Instruction {
    constructor(public i: number, public a: number, public b: number, public c: number) {}
    execute(reg: number[]): number[] {
        let result = [...reg];
        switch (this.i) {
            case InstructionCode.ADDR: result[this.c] = reg[this.a] + reg[this.b]; break;
            case InstructionCode.ADDI: result[this.c] = reg[this.a] + this.b; break;
            case InstructionCode.MULR: result[this.c] = reg[this.a] * reg[this.b]; break;
            case InstructionCode.MULI: result[this.c] = reg[this.a] * this.b; break;
            case InstructionCode.BANR: result[this.c] = reg[this.a] & reg[this.b]; break;
            case InstructionCode.BANI: result[this.c] = reg[this.a] & this.b; break;
            case InstructionCode.BORR: result[this.c] = reg[this.a] | reg[this.b]; break;
            case InstructionCode.BORI: result[this.c] = reg[this.a] | this.b; break;
            case InstructionCode.SETR: result[this.c] = reg[this.a]; break;
            case InstructionCode.SETI: result[this.c] = this.a; break;
            case InstructionCode.GTIR: result[this.c] = (this.a > reg[this.b])?1:0; break;
            case InstructionCode.GTRI: result[this.c] = (reg[this.a] > this.b)?1:0; break;
            case InstructionCode.GTRR: result[this.c] = (reg[this.a] > reg[this.b])?1:0; break;
            case InstructionCode.EQIR: result[this.c] = (this.a === reg[this.b])?1:0; break;
            case InstructionCode.EQRI: result[this.c] = (reg[this.a] === this.b)?1:0; break;
            case InstructionCode.EQRR: result[this.c] = (reg[this.a] === reg[this.b])?1:0; break;
            default:
                throw new Error(`Unknown instruction code specified: ${this.i}`);
                break;
        }
        return result;
    };
}
let InstructionCodeValues: InstructionCode[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

export class a201816 extends AoCPuzzle {
    currentLine = 0;
    numGT3 = 0;
    imap = new Map<number, Set<InstructionCode>>();
    phase = 1;
    reg = [0, 0, 0, 0];
    sampleMode(): void { };

    _loadData(lines: string[]): void {
        for (let i=0; i<16; i++) {
            this.imap.set(i, new Set(InstructionCodeValues));
        };
    }

    _runStep(): boolean {
        let moreToDo = true;
        if (this.phase === 1) {
            if (this.currentLine < this.lines.length && this.lines[this.currentLine].startsWith('Before:')) {
                //this.log(this.lines[this.currentLine])
                //this.log(this.lines[this.currentLine+2])
                //this.log(this.lines[this.currentLine+1])
                let matches = this.testOpcode(this.lines[this.currentLine], this.lines[this.currentLine+1], this.lines[this.currentLine+2]);
                if (matches.size >= 3) this.numGT3++;
                //this.log(`${this.lines[this.currentLine+1]} could match ${matches.map(k=>InstructionCode[k]).join(',')}`)

                this.currentLine += 4;
                // PART2: can optimize by skipping all the input once we know what each opcode is, but that invalidates part 1
                /* PART2: 
                if (Array.from(this.imap.values()).every(m => m.size === 1)) {
                    while (this.currentLine < this.lines.length && this.lines[this.currentLine].startsWith('Before:')) this.currentLine += 4;
                }
                */
            } else {
                this.log(`Part 1: ${this.numGT3}`);
                this.updateOpcodeMapping();
                InstructionCodeValues.forEach(i => {
                    this.log(`${i.toString().padStart(2, ' ')} is: ${Array.from(this.imap.get(i)).map(code => InstructionCode[code]).join(',')}`);
                });
                this.phase = 2;
            }

            this.result = this.numGT3.toString();
        } else { // phase 2
            let line = this.lines[this.currentLine];
            if (line) {
                this.runLine(line);
            }
            this.currentLine++;
            moreToDo = this.currentLine < this.lines.length;
            this.result = this.reg[0].toString();
        }

        return moreToDo;
    }

    updateOpcodeMapping() {
        let madeChange = true;
        while (madeChange && Array.from(this.imap.values()).some(a => a.size > 1)) {
            madeChange = false;
            InstructionCodeValues.forEach(i => {
                if (this.imap.get(i).size === 1) {
                    let singleValue = Array.from(this.imap.get(i))[0];
                    // remove this choice from everybody else
                    InstructionCodeValues.filter(j => j !== i).forEach(j => {
                        if (this.imap.get(j).has(singleValue)) {
                            madeChange = true;
                            this.imap.get(j).delete(singleValue);
                        }
                    });
                }
            });
        }
    }

    runLine(line: string) {
        let command = line.split(' ').map(Number);
        let i = Array.from(this.imap.get(command[0]))[0];
        this.reg = new Instruction(i, command[1], command[2], command[3]).execute(this.reg);
    }

    testOpcode(start: string, line: string, end: string): Set<InstructionCode> {
        let beforeReg = start.substring(start.indexOf('[')+1, start.indexOf(']')).split(',').map(Number);
        let command = line.split(' ').map(Number);
        let afterReg = end.substring(start.indexOf('[')+1, start.indexOf(']')).split(',').map(Number);
        let matches = new Set<InstructionCode>();
        // PART2: can optimize the evaluation by only testing the opcodes that this command could be, but that invalidates part 1
        // PART2: this.imap.get(command[0]).forEach(k => {
        InstructionCodeValues.forEach(k => {
            let iReg = new Instruction(k, command[1], command[2], command[3]).execute(beforeReg);
            if (iReg[0] === afterReg[0] && iReg[1] === afterReg[1] && iReg[2] === afterReg[2] && iReg[3] === afterReg[3]) {
                matches.add(k);
            }
        });
        let imapping = this.imap.get(command[0]);
        for (let i=0; i<16; i++) {
            if (!matches.has(i)) imapping.delete(i);
        }
        return matches;
    }

}