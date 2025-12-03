import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202503 extends AoCPuzzle {
    sum = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        const line = this.lines[this.stepNumber-1];
        const arr = line.split('').map(Number);
        // find first occurrence of max value up to end-1
        const max = Math.max(...arr.slice(0, -1));
        const maxP = arr.indexOf(max);
        const max2 = Math.max(...arr.slice(maxP+1));
        const num = max*10 + max2;
        console.log(`Max of ${line} = ${num} (${maxP})`);
        this.sum += num;
        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}