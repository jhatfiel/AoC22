import { AoCPuzzle } from '../../lib/AoCPuzzle';
import { CycleDetection } from '../../lib/cycleDetection';
import { GridParser } from '../../lib/gridParser';

export class a201818 extends AoCPuzzle {
    gp: GridParser;
    cd: CycleDetection;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
        this.cd = new CycleDetection();
        this.cd.logValue('', 0);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber !== 10000;

        let gridCopy = Array.from({length: this.gp.height}, _ => Array.from({length: this.gp.width}, _ => '.'));
        this.gp.grid.forEach((row, y) => {
            row.forEach((c, x) => {
                switch (c) {
                    case '.':
                        if (this.gp.gridAdjacentCells({x,y}).filter(c => c[1]==='|').length >= 3) c = '|';
                        break;
                    case '|':
                        if (this.gp.gridAdjacentCells({x,y}).filter(c => c[1]==='#').length >= 3) c = '#';
                        break;
                    case '#':
                        let adj = this.gp.gridAdjacentCells({x,y});
                        if (adj.filter(c => c[1]==='#').length < 1 || adj.filter(c => c[1]==='|').length < 1) c = '.';
                        break;
                    default:
                        break;
                }
                gridCopy[y][x] = c;
            })
        })
        this.gp.grid = gridCopy;

        let flat = gridCopy.flat();
        let numTrees = flat.filter(c => c === '|').length;
        let numMills = flat.filter(c => c === '#').length;
        let resourceValue = numTrees*numMills;
        if (this.stepNumber === 10) {
            this.log(`Part 1: numTrees=${numTrees}, numMills=${numMills}, resourceValue=${resourceValue}`);
        }
        this.result = resourceValue.toString();
        moreToDo = !this.cd.logValue(gridCopy.join(''), resourceValue);
        //this.log(`numTrees=${numTrees}, numMills=${numMills}, resourceValue=${resourceValue}, foundCycle=${moreToDo}`);
        if (!moreToDo) {
            this.result = this.cd.getValueAt(1000000000).value.toString();
        }

        return moreToDo;
    }
}