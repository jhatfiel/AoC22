import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202402 extends AoCPuzzle {
    safe = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let report = this.lines[this.stepNumber-1].split(' ').map(Number);
        //this.log(report);
        let isSafe = false;
        for (let remove = 0; remove < report.length; remove++) {
            let trimmedReport = [...report];

            trimmedReport.splice(remove, 1);

            let differences: number[] = [];
            for (let i=1; i<trimmedReport.length; i++) {
                differences.push(trimmedReport[i-1] - trimmedReport[i]);
            }
            //this.log(trimmedReport);
            //this.log(differences);

            let allNegative = differences.filter(d => d < 0).length === differences.length;
            let allPositive = differences.filter(d => d > 0).length === differences.length;
            let num3 = differences.filter(d => Math.abs(d) > 3).length;

            let thisIsSafe = ((allNegative || allPositive) && num3 <= 0);

            //this.log({allNegative, allPositive, num3, thisIsSafe});
            if (thisIsSafe) {
                isSafe = true;
                break;
            }
        }

        if (isSafe) this.safe++;

        if (!moreToDo){ 
            this.result = this.safe.toString();
        }
        return moreToDo;
    }
}