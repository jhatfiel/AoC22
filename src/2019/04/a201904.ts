import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a201904 extends AoCPuzzle {
    min = 264360;
    max = 746325;
    count1 = 0;
    count2 = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) { }

    _runStep(): boolean {
        const n = this.min-1+this.stepNumber;
        let moreToDo = n < this.max;
        const str = n.toString();
        let last2 = undefined;
        let last = str.charAt(0);
        let hasDupe = false;
        let hasDupe2 = false;
        let isIncreasing = true;
        for (let i=1; i<6 && isIncreasing; i++) {
          const ch = str.charAt(i);
          if (ch === last) {
            hasDupe = true;
            if (last2 !== ch && (i === 5 || str.charAt(i+1) !== ch)) hasDupe2 = true;
          }
          if (ch < last) isIncreasing = false;
          last2 = last;
          last = ch;
        }

        if (hasDupe && isIncreasing) {
          this.count1++;
        }

        if (hasDupe2 && isIncreasing) {
          console.log(`${str} is valid`);
          this.count2++;
        }


        if (!moreToDo) {
            console.log(`Part1: ${this.count1}`)
            console.log(`Part2: ${this.count2}`)
            this.result = this.count2.toString();
        }
        return moreToDo;
    }
}