import { GridParser, Pair, PairFromKey, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

type State = {
    at:Pair,
    seen: Set<string>
};
function copyState(s: State) {
    return {
        at: {x: s.at.x, y: s.at.y},
        seen: new Set(s.seen)
    }
}
let states = new Array<State>();
states.push({at: {x: 1, y: 0}, seen: new Set<string>()});

await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, []);

        let toProcess = [...states];
        while (toProcess.length) {
            //console.debug(`processing ${states.length} states (${toProcess.length} are unfinished)`)
            let state = toProcess.pop();

            let key = PairToKey(state.at);
            state.seen.add(key);
            let neighbors = Array.from(gp.getNeighbors(key)).map(k => PairFromKey(k[0])).filter(p => gp.grid[p.y][p.x] !== '#')
                .filter(p => {
                    let ch = gp.grid[p.y][p.x];
                    if (ch === '<') return p.x === state.at.x-1;
                    if (ch === '>') return p.x === state.at.x+1;
                    if (ch === 'v') return p.y === state.at.y+1;
                    if (ch === '^') return p.y === state.at.y-1;
                    return true;
                })
                .filter(n => !state.seen.has(PairToKey(n)));

            if (neighbors.length > 0) {
                if (neighbors.length > 1) {
                    for (let ns=1; ns<neighbors.length; ns++) {
                        let newState = copyState(state);
                        newState.at = {x: neighbors[ns].x, y: neighbors[ns].y};
                        states.push(newState);
                        toProcess.push(newState);
                    }
                }
                state.at = {x: neighbors[0].x, y: neighbors[0].y};
                toProcess.push(state);
            }
        }

        let longest = 0;
        states.forEach(s => {
            console.debug(`Path length: ${s.seen.size}`)
            longest = Math.max(longest, s.seen.size-1);
        })

        console.log(`Longest path: ${longest}`);
    });
