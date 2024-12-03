import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202403 extends AoCPuzzle {
    sum = 0;
    enabled = true;
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let line=this.lines[this.stepNumber-1];

        for (let match of line.matchAll(/mul\((\d\d?\d?),(\d\d?\d?)\)|do\(\)|don't\(\)/g)) {
            //this.log(match);
            if (match[0] === 'do()') {
                //this.log(`ENABLED`);
                this.enabled = true;
            } else if (match[0] === `don't()`) {
                //this.log(`DISABLED`);
                this.enabled = false;
            } else {
                if (this.enabled) {
                    //this.log('PROCESS');
                    this.sum += Number(match[1]) * Number(match[2]);
                } else {
                    //this.log('SKIP');
                }
            }
        }

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}