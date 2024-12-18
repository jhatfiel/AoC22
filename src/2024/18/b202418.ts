import { BFS } from './../../lib/bfs';
import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair, PairToKey } from '../../lib/gridParser.js';

export class b202418 extends AoCPuzzle {
    walls: Pair[] = [];
    pos = {x: 0, y: 0};
    width = 71;
    height = 71;
    numSplits: number;
    start = 0;
    end: number;
    stepSize: number;

    sampleMode(): void {
        this.width = 7;
        this.height = 7;
    };

    valid(p: Pair): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    _loadData(lines: string[]) {
        this.walls = lines.map(line => line.split(',')).map(arr => arr.map(Number)).map(arr => ({x: arr[0], y: arr[1]}));
        this.numSplits = Math.trunc(Math.log2(lines.length));
        this.stepSize = this.end = 2**this.numSplits;;
    }

    getShortestStepCount(): number {
        // what walls to consider
        let wallSet = new Set<string>(this.walls.slice(this.start, this.end).map(PairToKey));

        let startKey = PairToKey({x: 0, y: 0});
        let endKey = PairToKey({x: this.width-1, y: this.height-1});

        let bfs = new BFS((node: string) => {
            let results = new Set<string>();
            let [curX, curY] = node.split(',').map(Number);
            [[1,0],[0,1],[0,-1],[-1,0]].forEach(([dx,dy]) => {
                let x = curX + dx;
                let y = curY + dy;
                if (this.valid({x,y})) {
                    let key = PairToKey({x,y});
                    if (!wallSet.has(key)) {
                        results.add(key);
                    }
                }
            });
            //this.log(`GetNeighbors: ${state.at} returns ${JSON.stringify([...results.keys()])}`);
            return results;
        });
        let path = bfs.getShortestPath(startKey, endKey);
        return path !== undefined && path.length !== 0?path.length:-1;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.numSplits;
        this.stepSize >>=1;

        this.log(`[${this.stepNumber.toString().padStart(2)}]: ${this.start}-${this.end} half=${this.stepSize}`);
        let stepCount = this.getShortestStepCount();
        this.end += Math.sign(stepCount)*this.stepSize;

        if (!moreToDo) {
            this.result = (this.end < this.walls.length)?PairToKey(this.walls[this.end-1]):'ALL';
        }
        return moreToDo;
    }
}