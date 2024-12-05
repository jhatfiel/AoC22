import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202405 extends AoCPuzzle {
    sum = 0;
    part = 0;

    precede = Array.from({length: 100}, _=>[]);
    sampleMode(): void { };

    _loadData(lines: string[]) {
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let line = this.lines[this.stepNumber-1];
        if (line === '') {
            this.part++;
        } else {
            if (this.part === 0) {
                let [a, b] = line.split('|').map(Number);
                this.precede[a].push(b);
            } else {
                let arr = line.split(',').map(Number);
                this.log(line);
                let ok = true;
                for (let i=0; i<arr.length-1 && ok; i++) {
                    let a = arr[i];
                    for (let j=i+1; j<arr.length && ok; j++) {
                        let b = arr[j];
                        if (this.precede[b] && this.precede[b].indexOf(a) !== -1) {
                            this.log(`${b} was supposed to precede ${a}!!`);
                            ok = false;
                        }
                    }
                }
                if (ok) {
                    this.sum += arr[(arr.length-1)/2];
                }
            }
        }
        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}