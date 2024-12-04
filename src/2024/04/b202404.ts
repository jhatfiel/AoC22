import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202404 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) {

    }

    _runStep(): boolean {
        let moreToDo = false;
        let grid = this.lines.map(line=>line.split(''));
        let count=0;
        for (let r=1; r<grid.length-1; r++) {
            for (let c=1; c<grid[0].length-1; c++) {
                if (grid[r][c] !== 'A') continue;
                if ([grid[r-1][c-1],grid[r+1][c+1]].sort().join('') === 'MS' &&
                    [grid[r-1][c+1],grid[r+1][c-1]].sort().join('') === 'MS') count++
            }
        }
        if (!moreToDo) {
            this.result = count.toString();
        }
        return moreToDo;
    }
}