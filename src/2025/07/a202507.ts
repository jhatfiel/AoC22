import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202507 extends AoCPuzzle {
    count=0;
    beam: boolean[];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.beam = Array(lines[0].length).fill(false);
        this.beam[lines[0].indexOf('S')] = true;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-1;
        const line = this.lines[this.stepNumber];
        console.log(line);
        line.split('').forEach((ch, ind) => {
            if (ch === '.') return;
            if (this.beam[ind]) {
                this.beam[ind] = false;
                this.beam[ind-1] = true;
                this.beam[ind+1] = true;
                this.count++;
            }
        })
        console.log(this.beam.map(b=>b?'|':'.').join(''))
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}