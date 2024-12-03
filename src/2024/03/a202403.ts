import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202403 extends AoCPuzzle {
    sum = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let line=this.lines[this.stepNumber-1];

        for (let match of line.matchAll(/mul\((\d\d?\d?),(\d\d?\d?)\)/g)) {
            this.log(match);
            this.sum += Number(match[1]) * Number(match[2]);
        }

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}