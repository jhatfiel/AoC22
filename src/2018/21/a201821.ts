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
        let moreToDo = false;  //this.stepNumber <  9990; // true;

        //this.cpu._runStep();
        /*
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
        */

        let lastSeen = new Map<number, number>();
        let iterations = 0;
        let start = 0;
        let min = Infinity;
        let max = 0;
        let R0 = 0; // we can vary this to cause the program to stop
        let R1 = 0;
        let R2 = 0;
        let R3 = 0;
        let R5 = 0;

        do {
            start = R2;
            R5 = R2 | 0x10000
            R2 = 0x2228B2
            do {
                R3 = R5 & 0xFF
                R2 = R2 + R3
                R2 = R2 & 0xFFFFFF
                R2 = R2 * 0x1016B
                R2 = R2 & 0xFFFFFF
                if (256 > R5) break;
                /*
                R3 = 0
                do {
                    R1 = R3 + 1
                    R1 = R1 * 256
                    if (R1 > R5) break;
                    R3++
                } while (true)
                R5 = R3
                */
               //R5 = Math.floor(R5/256);
               R5 = R5 >> 8;
            } while (true);

            if (lastSeen.has(R2)) {
                this.result = this.lastNumber.toString();
                R0 = this.lastNumber;
                R2 = R0;
            } else {
                lastSeen.set(R2, iterations);
                if (this.firstNumber === undefined) {
                    this.firstNumber = R2;
                    this.log(`Part 1: ${this.firstNumber}`);
                }
                this.lastNumber = R2;
                iterations++;
            }
        } while (R2 !== R0)
            
        this.result = this.lastNumber.toString();

        return moreToDo;
    }
}