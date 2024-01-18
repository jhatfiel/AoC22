import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { BFS, BFS_State } from "../../lib/bfsearcher";
import { GridParser, PairFromKey } from "../../lib/gridParser";

export class b202323 extends AoCPuzzle {
    gp: GridParser;
    branchToBranchDistance = new Map<number, Map<number, number>>(); 
    finalKey: number;
    toKey(x:number,y:number): number { return ((x&0xFF)<<16) | (y&0xFF); }
    fromKey(k: number): {x: number, y: number} { return {x: 0xFF&(k>>16), y: 0xFF&k};}

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
    }

    _runStep(): boolean {
        let longest = 0;
        this.finalKey = this.toKey(this.gp.width-2,this.gp.height-1);

        let bfsNodes = new BFS<number>(this.getNodeNeighbors.bind(this), state => {
            if (state.at === this.finalKey && state.cost > longest) {
                longest = state.cost;
                this.log(`Found longer state: ${longest}`);
                this.log(`Path: ${Array.from(state.visited).map(n => this.fromKey(n)).map(n => `${n.x},${n.y}`).join(' / ')} cost = ${state.cost}`);
                return true;
            }
            return false;
        });
        bfsNodes.getPathsFrom(new BFS_State(this.toKey(1,0)));

        this.log(`Longest path: ${longest}`);
        this.result = longest.toString();
        return false;
    }

    getNodeNeighbors(state: BFS_State<number>): Map<number, number> {
        let result = this.branchToBranchDistance.get(state.at);
        if (result === undefined) {
            result = new Map<number, number>();
            this.branchToBranchDistance.set(state.at, result);
            let bfs = new BFS<number>(this.getNeighbors.bind(this));
            let states = bfs.getPathsFrom(new BFS_State<number>(state.at));
            // if this state can reach the final state, then it HAS to go to the final state (because it is the only one who can)
            if (states.some(p => p.at === this.finalKey)) {
                states = states.filter(p => p.at === this.finalKey);
            }
            states.forEach(s => {
                result.set(s.at, s.cost);
            })
        }
        return result;
    }

    getNeighbors(state: BFS_State<number>): Map<number, number> {
        let result = new Map<number, number>();
        let key = this.fromKey(state.at);
        let neighbors = Array.from(this.gp.getNeighbors(`${key.x},${key.y}`))
            .map(k => PairFromKey(k[0]))
            .filter(p => this.gp.grid[p.y][p.x] !== '#');

        if (state.visited.size === 1 || neighbors.length <= 2) {
            neighbors.forEach(n => result.set(this.toKey(n.x, n.y), 1));
        }

        return result;
    }
}