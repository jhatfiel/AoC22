import { AoCPuzzle } from '../../lib/AoCPuzzle';
import { CPU } from '../cpu';

export class a201821 extends AoCPuzzle {
    cpu: CPU;
    firstNumber: number;
    lastNumber = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.cpu = new CPU(this.lines);
        this.cpu.debug();
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber <  9990; // true;

        //this.cpu._runStep();

        if (this.cpu.ip === 28) {
            if (this.firstNumber === this.cpu.reg[2]) {
                moreToDo = false;
                this.result = this.lastNumber.toString();
            }
            if (this.firstNumber === undefined) {
                this.firstNumber = this.cpu.reg[2];
                this.log(`Part 1: ${this.firstNumber}`);
            }
            this.lastNumber = this.cpu.reg[2];
            //this.log(this.lastNumber.toString(16));
        }
        /*
        let R0 = 0; // we can vary this to cause the program to stop
        let R1 = 0;
        let R2 = 0;
        let R3 = 0;
        let R5 = 0;

        //do {
            R5 = R2 | 0x10000
            R2 = 0x2228B2
            
            do {
                R3 = R5 & 0xFF;
                R2 = R2 + R3;
                R2 = R2 & 0xFFFFFF;
                R2 *= 65899;
                R2 = R2 & 0xFFFFFF;
                if (0xFF > R5) break;

                R3 = 0;
                for (R1=1; R1<=R5; R1*=0xFF) {
                    R3++
                }
                R5 = R3;

            } while (true);
        //} while (R2 !== R0);
        this.result = R2.toString();
        */

        // 13970209
        return moreToDo;
    }
}