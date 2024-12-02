import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202402 extends AoCPuzzle {
    safe = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let report = this.lines[this.stepNumber-1].split(' ').map(Number);
        //this.log(report);
        let differences: number[] = [];
        for (let i=1; i<report.length; i++) {
            differences.push(report[i-1] - report[i]);
        }

        let allNegative = differences.filter(d => d < 0).length === differences.length;
        let allPositive = differences.filter(d => d > 0).length === differences.length;
        let num3 = differences.filter(d => Math.abs(d) > 3).length;

        let isSafe = ((allNegative || allPositive) && num3 === 0);

        if (isSafe) this.safe++;
        //this.log({allNegative, allPositive, num3, isSafe});

        this.result = this.safe.toString();
        return moreToDo;
    }
}