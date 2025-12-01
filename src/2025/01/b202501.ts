import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202501 extends AoCPuzzle {
    pos = 10000050;
    dialSize = 100;
    zeros = 0;

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        const steps = {'L': -1, 'R': 1}[this.lines[this.stepNumber-1][0]] * Number(this.lines[this.stepNumber-1].substring(1));
        const newPos = this.pos + steps;
        const oldOnZero = this.pos % this.dialSize === 0;
        const newOnZero = newPos % this.dialSize === 0;
        const oldH = Math.floor(this.pos / this.dialSize);
        const newH = Math.floor(newPos / this.dialSize);
        if (steps > 0) {
            this.zeros += newH - oldH;
        } else {
            if (newOnZero) this.zeros++;
            this.zeros += oldH - newH;
            if (oldOnZero) this.zeros--;
        }


        this.pos = newPos;
        console.log(`Step ${this.stepNumber} processing line: ${this.lines[this.stepNumber-1]}: ${steps}: pos=${this.pos} zeros=${this.zeros}`);
        if (!moreToDo) {
            this.result = this.zeros.toString();
        }
        return moreToDo;
    }
}