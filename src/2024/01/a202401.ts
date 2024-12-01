import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202401 extends AoCPuzzle {
    a: number[] = [];
    b: number[] = [];
    sum = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        lines.map(line => line.split(/ +/).map(Number)).forEach(([a,b]) => {this.a.push(a); this.b.push(b);})
        this.a.sort();
        this.b.sort();
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.a.length;
        let ind = this.stepNumber-1;
        this.sum += Math.abs(this.a[ind] - this.b[ind]);

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}