import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202506 extends AoCPuzzle {
    expr: {nums: number[], op: string}[] = [];
    total = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        const numLines = lines.slice(0, -1);
        const opsLine = lines.at(-1);
        let op = opsLine[0];
        let nums: number[] = [];
        for (let i=0; i<opsLine.length; i++) {
            if (opsLine[i] !== ' ') {
                if (nums.length > 0) {
                    // add this expr
                    this.expr.push({nums, op});
                }

                op = opsLine[i];
                nums = [];
            }

            nums.push(Number(numLines.map(l => l.charAt(i)).join('')));
        }
        // add the last expr
        this.expr.push({nums, op});

        console.log(JSON.stringify(this.expr));
        console.log(this.expr);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.expr.length
        const expr = this.expr[this.stepNumber-1];
        const mul = expr.op==='*';
        const nums = expr.nums.filter(n=>n);
        const total = nums.reduce((n, acc) => acc = mul?acc*n:acc+n, mul?1:0);
        console.log(`nums: ${nums}, mul=${mul}, total: ${total}`);
        this.total += total;
        if (!moreToDo) {
            this.result = this.total.toString();
        }
        return moreToDo;
    }
}