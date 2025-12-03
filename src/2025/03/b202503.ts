import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202503 extends AoCPuzzle {
    sum = 0;
    length = 12;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        const line = this.lines[this.stepNumber-1];
        const arr = line.split('').map(Number);
        let num = 0;

        //console.log(`line=${line}`)
        while (Math.log10(num)+1 < this.length) {
            const len = num?Math.log10(num)+1:0
            const rem = this.length - len;
            const max = Math.max(...arr.slice(0, arr.length-rem+1));
            const maxP = arr.indexOf(max);

            arr.splice(0, maxP+1);
            num = num*10 + max;
            //console.log(`${len.toString().padStart(3)}: ${num} (rem=${rem}, maxP=${maxP})`);
        }
        this.sum += num;
        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}