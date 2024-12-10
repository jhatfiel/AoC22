import { BFS, BFS_State } from './../../lib/bfsearcher.js';
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
            let bfs = new BFS((state: BFS_State<Pair>) => {
                let nextLevel = (Number(this.gp.grid[state.at.y][state.at.x]) + 1).toString();;
                return new Map<Pair, number>(this.gp.gridOrthogonalP(state.at).filter(([p]) => this.gp.grid[p.y][p.x] === nextLevel).map(([p]) => ([p,1])));
            },
            (state: BFS_State<Pair>) => {
                return this.gp.grid[state.at.y][state.at.x] === '9'
            }
            );
            let paths = bfs.getPathsFrom({x,y});
            //this.log(paths.map(state=>state.toString()).join('\n'));
            this.score += new Set(paths.map(state=>PairToKey([...state.visited.keys()].at(-1)))).size;
            this.score2 += paths.length;
        }
        if (!moreToDo) {
            this.result = this.score.toString();
            this.log(`Part 2: ${this.score2}`);
        }
        return moreToDo;
    }
}