import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202509 extends AoCPuzzle {
    grid: boolean[][] = Array.from({length:100000}, () => []);
    corners: number[][];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let max = 0;
        this.corners = lines.map(l=>l.split(',').map(Number));

        for (let i=0; i<this.corners.length-1; i++) {
            const ac = this.corners[i];
            for (let j=i+1; j<this.corners.length; j++) {
                const jc = this.corners[j];
                const a=Math.abs((ac[0]-jc[0] + 1)*(ac[1]-jc[1] + 1))
                if (a > max) max = a;
            }
        }
        this.result = max.toString();
    }

    _runStep(): boolean {
        let moreToDo = false;
        return moreToDo;
    }
}