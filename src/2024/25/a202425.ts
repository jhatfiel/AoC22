import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202425 extends AoCPuzzle {
    keys: number[][] = [];
    locks: number[][] = [];
    fit = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        for (let i=0; i<lines.length; i++) {
            let heights = [0,0,0,0,0];
            let arr = lines[i].split('');
            let char = arr[0];

            for (let j=1; j<6; j++) {
                arr = lines[i+j].split('');
                //this.log(arr);
                for (let c=0; c<arr.length; c++) {
                    if (arr[c] === char) heights[c]++;
                }
            }

            //this.log(char);
            //this.log(heights);
            //this.log('-----------');

            i += 7;
            if (char === '#') this.locks.push(heights);
            else              this.keys.push(heights);
        }

    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.locks.length;
        let lock = this.locks[this.stepNumber-1];
        //this.log(lock);
        for (let j=0; j<this.keys.length; j++) {
            let key = this.keys[j];
            //this.log(`compared to: `, key);
            if (lock.every((n,i) => n <= key[i])) {
                this.fit++;
            }
        }

        if (!moreToDo) {
            this.result = this.fit.toString();
        }
        return moreToDo;
    }
}