import { AoCPuzzle } from "../../lib/AoCPuzzle.js";
import { BFS, BFS_State } from "../../lib/bfsearcher.js";
import { GridParser, PairFromKey, PairToKey } from "../../lib/gridParser.js";

export class a202323 extends AoCPuzzle {
    gp: GridParser;
    loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
    }
    _runStep(): boolean {
        let bfs = new BFS(this.getNeighbors.bind(this));

        let states = bfs.getPathsFrom(new BFS_State('1,0'));

        let longest = 0;
        states.forEach(s => {
            console.debug(`Path length: ${s.cost} ends at ${Array.from(s.visited.keys()).slice(s.visited.size-6).join(' / ')}`)
            longest = Math.max(longest, s.cost);
        })

        console.log(`Longest path: ${longest}`);
        this.result = longest.toString();
        return false;
    }

    getNeighbors(state: BFS_State): Map<string, number> {
        let result = new Map<string, number>();
        let at = PairFromKey(state.at);
        //console.debug(`getNeighbors: ${state.at} current cost: ${state.cost}, [${Array.from(state.visited.keys()).join(' / ')}]`)
        //if (state.visited.size > 5) return result;
        Array.from(this.gp.getNeighbors(state.at))
            .map(k => PairFromKey(k[0]))
            .filter(p => {
                let ch = this.gp.grid[p.y][p.x];
                if (ch === '#') return false;
                if (ch === '<') return p.x === at.x-1;
                if (ch === '>') return p.x === at.x+1;
                if (ch === 'v') return p.y === at.y+1;
                if (ch === '^') return p.y === at.y-1;
                return true;
            })
            .forEach(n => result.set(PairToKey(n), 1));
        return result;
    }
}
