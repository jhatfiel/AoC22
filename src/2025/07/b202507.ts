import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202507 extends AoCPuzzle {
    count=0;
    tach: number[];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.tach = Array(lines[0].length).fill(0);
        this.tach[lines[0].indexOf('S')] = 1;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-1;
        const line = this.lines[this.stepNumber];
        console.log(line);
        line.split('').forEach((ch, ind) => {
            if (ch === '.') return;
            if (this.tach[ind]) {
                this.tach[ind-1] += this.tach[ind];
                this.tach[ind+1] += this.tach[ind];
                this.tach[ind] = 0;
            }
        })
        console.log(this.tach.map(b=>b?b:'.').join(''))
        console.log(this.tach.reduce((n, acc) => acc+n, 0).toString());
        if (!moreToDo) {
            this.result = this.tach.reduce((n, acc) => acc+n, 0).toString();
        }
        return moreToDo;
    }
}