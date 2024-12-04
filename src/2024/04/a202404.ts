import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202404 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = false;
        let grid = this.lines.map(line=>line.split(''));
        let count=0;
        for (let r=0; r<grid.length; r++) {
            for (let c=0; c<grid[0].length; c++) {
                [[-1,-1],[-1,0],[-1,1],
                 [0,-1],        [0,1],
                 [1,-1],[1,0],[1,1]].forEach(([rd,cd]) => {
                    let [r1,c1] = [r+rd,c+cd];
                    let [r2,c2] = [r+2*rd,c+2*cd];
                    let [r3,c3] = [r+3*rd,c+3*cd];
                    if (r1>=0 && c1>=0 && r1<grid.length && c1<grid[0].length &&
                        r2>=0 && c2>=0 && r2<grid.length && c2<grid[0].length &&
                        r3>=0 && c3>=0 && r3<grid.length && c3<grid[0].length &&
                        grid[r][c] === 'X' &&
                        grid[r1][c1] === 'M' &&
                        grid[r2][c2] === 'A' &&
                        grid[r3][c3] === 'S'
                    ) {
                        count++

                    }

                 });
            }
        }
        if (!moreToDo) {
            this.result = count.toString();
        }
        return moreToDo;
    }
}