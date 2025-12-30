import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a201901 extends AoCPuzzle {
    sum = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {}

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let mass = Number(this.lines[this.stepNumber-1]);
        let fuel = Math.floor(mass/3) - 2;
        this.sum += fuel;
        console.log(`Mass of ${mass} needs ${fuel}`);
        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}