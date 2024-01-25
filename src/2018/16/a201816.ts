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

export class a201816 extends AoCPuzzle {
    currentLine = 0;
    numGT3 = 0;
    imap = new Map<number, Array<InstructionCode>>();
    phase = 1;
    reg = [0, 0, 0, 0];
    sampleMode(): void { };

    _loadData(lines: string[]): void {
        Object.keys(InstructionCode).filter(k => isNaN(+k)).forEach(k => {
            this.imap.set(InstructionCode[k], Object.keys(InstructionCode).filter(v => isNaN(+v)).map(v => InstructionCode[v]));
        });
    }

    _runStep(): boolean {
        let moreToDo = true;
        if (this.phase === 1) {
            if (this.currentLine < this.lines.length && this.lines[this.currentLine].startsWith('Before:')) {
                //this.log(this.lines[this.currentLine])
                //this.log(this.lines[this.currentLine+2])
                //this.log(this.lines[this.currentLine+1])
                let matches = this.testOpcode(this.lines[this.currentLine], this.lines[this.currentLine+1], this.lines[this.currentLine+2]);
                if (matches.length >= 3) this.numGT3++;
                //this.log(`${this.lines[this.currentLine+1]} could match ${matches.map(k=>InstructionCode[k]).join(',')}`)

                this.currentLine += 4;
            } else {
                this.log(`Part 1: ${this.numGT3}`)
                this.identifyOpcodeMapping();
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

    identifyOpcodeMapping() {
        let madeChange = true;
        while (madeChange && Array.from(this.imap.values()).some(a => a.length > 1)) {
            madeChange = false;
            for (let i=0; i<16; i++) {
                if (this.imap.get(i).length === 1) {
                    let singleValue = this.imap.get(i)[0];
                    // remove this choice from everybody else
                    for (let j=0; j<16; j++) {
                        if (j === i) continue;
                        if (this.imap.get(j).indexOf(singleValue) !== -1) {
                            madeChange = true;
                            this.imap.set(j, this.imap.get(j).filter(k => k !== singleValue));
                        }
                    }
                }
            }
        }
        for (let i=0; i<16; i++) {
            this.log(`${i.toString().padStart(2, ' ')} is: ${InstructionCode[this.imap.get(i).join(',')]}`);
        }
    }

    runLine(line: string) {
        let command = line.split(' ').map(Number);
        let i = this.imap.get(command[0])[0];
        this.reg = new Instruction(i, command[1], command[2], command[3]).execute(this.reg);
    }

    testOpcode(start: string, line: string, end: string): InstructionCode[] {
        let beforeReg = start.substring(start.indexOf('[')+1, start.indexOf(']')).split(',').map(Number);
        let command = line.split(' ').map(Number);
        let afterReg = end.substring(start.indexOf('[')+1, start.indexOf(']')).split(',').map(Number);
        let matches: InstructionCode[] = [];
        Object.keys(InstructionCode).filter(k => isNaN(+k)).forEach(k => {
            let iReg = new Instruction(InstructionCode[k], command[1], command[2], command[3]).execute(beforeReg);
            let matched = false;
            if (iReg[0] === afterReg[0] && iReg[1] === afterReg[1] && iReg[2] === afterReg[2] && iReg[3] === afterReg[3]) {
                matched = true;
                matches.push(InstructionCode[k]);
            }
        });
        this.imap.set(command[0], this.imap.get(command[0]).filter(k => matches.indexOf(k) !== -1));
        return matches;
    }

}