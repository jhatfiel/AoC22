import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { BFS } from '../../lib/bfs.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';

export class a202420 extends AoCPuzzle {
    gp: GridParser;
    start: Pair;
    end: Pair;
    walls: Pair[];
    wallSet: Set<string>;
    length: number;
    originalPath: string[];
    count = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/S/g, /E/g, /#/g]);
        this.start = this.gp.matches.filter(m=>m.typeIndex===0)[0];
        this.end = this.gp.matches.filter(m=>m.typeIndex===1)[0];
        this.walls = this.gp.matches.filter(m=>m.typeIndex===2);
        this.wallSet = new Set(this.walls.map(p=>PairToKey(p)));

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
        this.log(this.originalPath);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.originalPath.length-1;
        let tryCheatFrom = PairFromKey(this.originalPath[this.stepNumber-1]);
        //this.log(`Trying to cheat from`, tryCheatFrom);
        [[1,0],[0,1],[0,-1],[-1,0]].forEach(([dx,dy]) => {
            let x = tryCheatFrom.x + dx;
            let y = tryCheatFrom.y + dy;
            let key = PairToKey({x,y});
            let cheatKey = key;
            if (this.wallSet.has(key)) {
                x += dx;
                y += dy;
                key = PairToKey({x,y});
                cheatKey += `,` + key;
                let pathIndex = this.originalPath.indexOf(key);
                let saved = pathIndex - this.stepNumber - 1;
                if (pathIndex !== -1 && saved >= 100) {
                    this.log(`FOUND CHEAT!! ${cheatKey} ${pathIndex} ${saved}`);
                    this.count++
                }
            }
        });

        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}