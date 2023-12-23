import { BFS, BFS_State } from "../../lib/bfsearcher.js";
import { GridParser, PairFromKey, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let branchToBranchDistance = new Map<string, Map<string, number>>(); 

let gp: GridParser;
await puzzle.run()
    .then((lines: Array<string>) => {
        gp = new GridParser(lines, []);

        let longest = 0;
        let finalKey = `${gp.width-2},${gp.height-1}`;

        let bfsNodes = new BFS(getNodeNeighbors, state => {
            if (state.at === finalKey && state.cost > longest) {
                longest = state.cost;
                console.debug(`Found longer state: ${longest}`);
                console.debug(`Path: ${Array.from(state.visited).join(' / ')} cost = ${state.cost}`);
                return true;
            }
            return false;
        });
        bfsNodes.getPathsFrom(new BFS_State('1,0'));

        console.log(`Longest path: ${longest}`);

    });

function getNodeNeighbors(state: BFS_State): Map<string, number> {
    let result = branchToBranchDistance.get(state.at);
    if (result === undefined) {
        console.debug(`Calculating reachable branch points for ${state.at}`);
        result = new Map<string, number>();
        branchToBranchDistance.set(state.at, result);
        let bfs = new BFS(getNeighbors);
        let states = bfs.getPathsFrom(new BFS_State(state.at));
        states.forEach(s => {
            //console.debug(`state from ${state.at} ends at ${s.at} cost=${s.cost}`);
            result.set(s.at, s.cost);
        })
    }
    return result;
}

function getNeighbors(state: BFS_State): Map<string, number> {
    let result = new Map<string, number>();
    let neighbors = Array.from(gp.getNeighbors(state.at))
        .map(k => PairFromKey(k[0]))
        .filter(p => gp.grid[p.y][p.x] !== '#');

    if (state.visited.size === 1 || neighbors.length <= 2) {
        neighbors.forEach(n => result.set(PairToKey(n), 1));
    }

    return result;
}