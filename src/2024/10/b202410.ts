import { BFS, BFS_State } from './../../lib/bfsearcher';
import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';

export class b202410 extends AoCPuzzle {
    gp: GridParser;
    score = 0;
    score2 = 0; 
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.gp.width*this.gp.height;
        let x = (this.stepNumber-1)%this.gp.width;
        let y = Math.floor((this.stepNumber-1)/this.gp.width);
        let key = PairToKey({x,y});

        if (this.gp.grid[y][x] === '0') {
            let bfs = new BFS((state: BFS_State<string>) => {
                return new Map<string, number>(this.gp.gridOrthogonalP(PairFromKey(state.at)).filter().map(([p]) => ([PairToKey(p),1])));
            })
            let paths = bfs.getPathsFrom(key);
            this.log(paths.map(state=>state.toString()).join('/'));
            this.log(`Total paths: ${paths.length}`);
        }
        if (!moreToDo) {
            this.result = this.score.toString();
            this.log(`Part 2: ${this.score2}`);
        }
        return moreToDo;
    }
}