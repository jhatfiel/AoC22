import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { BFS } from '../../lib/bfs.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';

export class b202420 extends AoCPuzzle {
    gp: GridParser;
    start: Pair;
    end: Pair;
    walls: Pair[];
    wallSet: Set<string>;
    originalPath: string[];
    originalPathPairs: Pair[];
    originalPathIndex: number[][];
    count = 0;
    startNow = Date.now();

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/S/g, /E/g, /#/g]);
        this.start = this.gp.matches.filter(m=>m.typeIndex===0)[0];
        this.end = this.gp.matches.filter(m=>m.typeIndex===1)[0];
        this.walls = this.gp.matches.filter(m=>m.typeIndex===2);
        this.wallSet = new Set(this.walls.map(p=>PairToKey(p)));
        this.originalPathIndex = Array.from({length: this.gp.height}, _=>[]);

        // find base case
        let bfs = new BFS(node=>{
            let results = new Set<string>();
            let [curX, curY] = node.split(',').map(Number);
            [[1,0],[0,1],[0,-1],[-1,0]].forEach(([dx,dy]) => {
                let x = curX + dx;
                let y = curY + dy;
                if (this.gp.valid({x,y})) {
                    let key = PairToKey({x,y});
                    if (!this.wallSet.has(key)) {
                        results.add(key);
                    }
                }
            });
            //this.log(`GetNeighbors: ${state.at} returns ${JSON.stringify([...results.keys()])}`);
            return results;
        });
        this.originalPath = bfs.getShortestPath(PairToKey(this.start), PairToKey(this.end));
        this.originalPath.push(PairToKey(this.end));
        this.originalPathPairs = this.originalPath.map(s=>PairFromKey(s));
        this.originalPathPairs.forEach((p,ind) => this.originalPathIndex[p.y][p.x] = ind);
        this.log(`Setup time: ${Date.now()-this.startNow}ms`);
        //this.log(this.originalPath);
    }

    _runStep(): boolean {
        let stepNow = Date.now();
        let moreToDo = this.stepNumber < this.originalPath.length-1;
        let from = this.originalPath[this.stepNumber - 1];
        let tryCheatFrom = PairFromKey(from);
        let stepCount = 0;

        /*
        // original method of looping through all the remaining slice positions, a litte slower
        this.originalPathPairs.slice(this.stepNumber + 100).forEach((futurePos, stepIndex) => {
            let distance = Math.abs(futurePos.x - tryCheatFrom.x) + Math.abs(futurePos.y - tryCheatFrom.y);
            let saved = stepIndex - distance + 1 + 100;
            if (distance <= 20 && saved >= 100) {
                //this.log(`FOUND CHEAT!! ${this.originalPath[this.stepNumber-1]} to ${futurePos.x},${futurePos.y} ${saved}`);
                stepCount++;
            }
        });
        /*/

        // Faster, but more complicated code.
        // Try all positions in a circle (well, diamond) of radius 20 around the current position and see if we could cheat to there
        for (let xd = 0; xd <= 20; xd++) {
            for (let yd = 0; yd <= 20-xd; yd++) {
                // see if tryCheatFrom+{xd,yd} is on path
                // but we have to go in all 4 quadrants
                [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([xdm, ydm]) => {
                    if (xd === 0 && xdm === -1) return; // don't double count positions orthogonal from us
                    if (yd === 0 && ydm === -1) return;
                    let x = tryCheatFrom.x + xdm*xd;
                    let y = tryCheatFrom.y + ydm*yd;
                    if (this.gp.valid({x,y})) {
                        let stepIndex = this.originalPathIndex[y][x];
                        if (stepIndex !== -1 && stepIndex > this.stepNumber + 100) {
                            let distance = xd + yd;
                            let saved = stepIndex - distance - this.stepNumber + 1;
                            if (saved >= 100) {
                                //this.log(`FOUND CHEAT!! ${this.originalPath[this.stepNumber-1]} to ${x},${y} ${saved}`);
                                stepCount++;
                            }
                        }
                    }
                });
            }
        }
        //*/

        //this.log(`[${this.stepNumber.toString().padStart(4)}]: (${this.count.toString().padStart(5)}) ${from} found ${stepCount} in ${Date.now()-stepNow}ms`);

        this.count += stepCount;

        if (!moreToDo) {
            this.log(`Total time: ${Date.now() - this.startNow}ms`);
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}