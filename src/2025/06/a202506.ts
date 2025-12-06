import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202506 extends AoCPuzzle {
    nums: number[][];
    ops: string[];
    total = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.nums = lines.slice(0, -1).map(l => l.trim().split(/ +/g).map(Number))
        this.ops = lines.at(-1).trim().split(/ +/g);
        console.log(JSON.stringify(this.nums));
        console.log(this.ops);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.ops.length
        const op = this.ops[this.stepNumber-1]==='*';
        const nums = this.nums.map(arr => arr[this.stepNumber-1]);
        const total = nums.reduce((n, acc) => acc = op?acc*n:acc+n, op?1:0);
        console.log(`col: ${nums}, op=${op}, total: ${total}`);
        this.total += total;
        if (!moreToDo) {
            this.result = this.total.toString();
        }
        return moreToDo;
    }
}