import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202501 extends AoCPuzzle {
    pos = 50;
    dialSize = 100;
    zeros = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) {
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        const steps = {'L': -1, 'R': 1}[this.lines[this.stepNumber-1][0]] * Number(this.lines[this.stepNumber-1].substring(1));
        this.pos = ((this.pos + steps)%this.dialSize + this.dialSize)%this.dialSize
        if (this.pos === 0) this.zeros++;

        console.log(`Step ${this.stepNumber} processing line: ${this.lines[this.stepNumber-1]}: ${steps}: pos=${this.pos}`);
        if (!moreToDo) {
            this.result = this.zeros.toString();
        }
        return moreToDo;
    }
}