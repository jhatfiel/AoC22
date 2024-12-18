import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { BFS, BFS_State } from '../../lib/bfsearcher.js';
import { Pair, PairToKey } from '../../lib/gridParser.js';

export class a202418 extends AoCPuzzle {
    walls: Pair[] = [];
    wallSet = new Set<string>();
    pos = {x: 0, y: 0};
    width = 71;
    height = 71;
    after = 1024;

    sampleMode(): void {
        this.width = 7;
        this.height = 7;
        this.after = 12;
    };

    valid(p: Pair): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    _loadData(lines: string[]) {
        this.walls = lines.slice(0, this.after).map(line => line.split(',')).map(arr => arr.map(Number)).map(arr => ({x: arr[0], y: arr[1]}));
        this.wallSet = new Set<string>(this.walls.map(PairToKey));
    }

    getSolutionStepsAt(time: number): number {
        let startKey = PairToKey({x: 0, y: 0});

        let stepNum = 0;
        let frontier: string[] = [startKey];
        let found = false;
        OUTER: while (frontier.length) {
            let newFrontier = new Set<string>();
            for (let n of frontier) {
                let [curX, curY] = n.split(',').map(Number);
                if (curX === this.width-1 && curY === this.height-1) {
                    found = true;
                    break OUTER;
                }
                [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy]) => {
                    let x = curX + dx;
                    let y = curY + dy;
                    let key = PairToKey({x,y});
                    if (this.valid({x,y}) && !this.wallSet.has(key)) {
                        newFrontier.add(PairToKey({x,y}));
                    }
                });
            }

            stepNum++;
            frontier = [...newFrontier.keys()];
        }

        return found?stepNum:-1;
    }

    _runStep(): boolean {
        let moreToDo = false;
        let stepCount = this.getSolutionStepsAt(this.after);

        /*
        let bfs = new BFS((state: BFS_State<string>) => {
            let results = new Map<string, number>();
            let [curX, curY] = state.at.split(',').map(Number);
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy]) => {
                let x = curX + dx;
                let y = curY + dy;
                let key = PairToKey({x,y});
                if (this.valid({x,y}) && !this.wallSet.has(key)) {
                    results.set(PairToKey({x,y}), 1);
                }
            });
            //this.log([...results.keys()]);
            return results;
        }, (state=>state.at === endKey));

        this.log({startKey, endKey});
        let nodes = bfs.getPathsBetweenNodes(startKey, endKey, true);
        this.log(nodes.map(n=>[...n.visited.keys()]));
        */


        if (!moreToDo) {
            this.result = stepCount.toString();
        }
        return moreToDo;
    }
}