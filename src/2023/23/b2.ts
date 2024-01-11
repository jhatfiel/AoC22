import { BFS, BFS_State } from "../../lib/bfsearcher.js";
import { GridParser, PairFromKey, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let branchToBranchDistance = new Map<number, Map<number, number>>(); 
let finalKey: number;
function toKey(x:number,y:number): number { return ((x&0xFF)<<16) | (y&0xFF); }
function fromKey(k: number): {x: number, y: number} { return {x: 0xFF&(k>>16), y: 0xFF&k};}

let gp: GridParser;
await puzzle.run()
    .then((lines: Array<string>) => {
        gp = new GridParser(lines, []);

        let longest = 0;
        finalKey = toKey(gp.width-2,gp.height-1);

        let bfsNodes = new BFS<number>(getNodeNeighbors, state => {
            if (state.at === finalKey && state.cost > longest) {
                longest = state.cost;
                console.debug(`Found longer state: ${longest}`);
                console.debug(`Path: ${Array.from(state.visited).map(n => fromKey(n)).map(n => `${n.x},${n.y}`).join(' / ')} cost = ${state.cost}`);
                return true;
            }
            return false;
        });
        bfsNodes.getPathsFrom(new BFS_State(toKey(1,0)));

        console.log(`Longest path: ${longest}`);

    });

function getNodeNeighbors(state: BFS_State<number>): Map<number, number> {
    let result = branchToBranchDistance.get(state.at);
    if (result === undefined) {
        result = new Map<number, number>();
        branchToBranchDistance.set(state.at, result);
        let bfs = new BFS<number>(getNeighbors);
        let states = bfs.getPathsFrom(new BFS_State<number>(state.at));
        // if this state can reach the final state, then it HAS to go to the final state (because it is the only one who can)
        if (states.some(p => p.at === finalKey)) {
            states = states.filter(p => p.at === finalKey);
        }
        states.forEach(s => {
            //console.debug(`state from ${state.at} ends at ${s.at} cost=${s.cost}`);
            result.set(s.at, s.cost);
        })
    }
    return result;
}

function getNeighbors(state: BFS_State<number>): Map<number, number> {
    let result = new Map<number, number>();
    let key = fromKey(state.at);
    let neighbors = Array.from(gp.getNeighbors(`${key.x},${key.y}`))
        .map(k => PairFromKey(k[0]))
        .filter(p => gp.grid[p.y][p.x] !== '#');

    if (state.visited.size === 1 || neighbors.length <= 2) {
        neighbors.forEach(n => result.set(toKey(n.x, n.y), 1));
    }

    return result;
}