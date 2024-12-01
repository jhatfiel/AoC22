import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202401 extends AoCPuzzle {
    a: number[] = [];
    b: number[] = [];
    sum = 0;
    bInd = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        lines.map(line => line.split(/ +/).map(Number)).forEach(([a,b]) => {this.a.push(a); this.b.push(b);})
        this.a.sort();
        this.b.sort();
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.a.length;
        let ind = this.stepNumber-1;
        let num = this.a[ind];
        while (this.bInd < this.b.length && this.b[this.bInd] < num) this.bInd++;
        let cnt = 0;
        while (this.bInd+cnt < this.b.length && this.b[this.bInd+cnt]===num) cnt++;
        //this.log(`[${this.stepNumber}] ind=${ind} sum=${this.sum} num=${num} cnt=${cnt}`);
        this.sum += cnt*num;

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}