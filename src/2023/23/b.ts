import { stripVTControlCharacters } from "util";
import { GridParser, Pair, PairFromKey, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

type State = {
    at:Pair,
    seen: Set<string>,
    finished: boolean
};
function copyState(s: State) {
    return {
        at: {x: s.at.x, y: s.at.y},
        seen: new Set(s.seen),
        finished: s.finished
    }
}
let states = new Array<State>();
states.push({at: {x: 1, y: 0}, seen: new Set<string>(), finished: false});
let choke = new Set<string>();
choke.add('1,0');

let edges = new Map<string, Map<string, number>>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, []);
        choke.add(`${gp.width-2},${gp.height-1}`);

        for (let x=0; x<gp.width-1; x++) {
            for (let y=0; y<gp.height-1; y++) {
                let ch = gp.grid[y][x];
                if (ch !== '#') {
                    let neighbors = Array.from(gp.getNeighbors(PairToKey({x,y}))).map(k => PairFromKey(k[0])).filter(p => gp.grid[p.y][p.x] !== '#')
                    if (neighbors.length > 2) choke.add(`${x},${y}`);
                }
            }
        }

        console.debug(`Total chokepoints: ${choke.size}`);

        // get distances between all pairs of chokepoints
        for (let ind = 0; ind < choke.size; ind++) {
            // get distance
            let key = Array.from(choke)[ind]; 
            let thisSet = new Map<string, number>();
            edges.set(key, thisSet);
            let paths = getPathsFrom(gp, PairFromKey(key));
            paths.forEach(p => {
                let final = p[p.length-1];
                let distance = p.length-1;
                thisSet.set(final, distance);
            });
        }

        // find combinations of nodes
        let states = new Array<NodeState>();
        states.push({currentNode: Array.from(choke)[0], seenNodes: new Set<string>(), distance: 0});

        let longestStateLength = 0;
        let toProcess = states.filter(_ => true);
        while (toProcess.length) {
            let state = toProcess.pop();
            //console.debug(`processing ${states.length} states (${toProcess.length} are unfinished)`)
            //console.debug(`Checking from ${state.currentNode}`)
            let tryGoingTo = Array.from(edges.get(state.currentNode).keys()).filter(nextNode => !state.seenNodes.has(nextNode))

            if (tryGoingTo.length > 0) {
                tryGoingTo.slice(1).forEach(nextNode => {
                    let distanceTo = edges.get(state.currentNode).get(nextNode);
                    let newState = copyNodeState(state);
                    newState.distance += distanceTo;
                    newState.seenNodes.add(state.currentNode);
                    newState.currentNode = nextNode;
                    toProcess.push(newState);
                    //states.push(newState);
                });

                let nextNode = tryGoingTo[0];
                let distanceTo = edges.get(state.currentNode).get(nextNode);
                state.distance += distanceTo;
                state.seenNodes.add(state.currentNode);
                state.currentNode = nextNode;
                toProcess.push(state);
            } else {
                // this state is done, remove it if it's not the longest one
                if (state.currentNode === `${gp.width-2},${gp.height-1}` && state.distance > longestStateLength) {
                    longestStateLength = state.distance;
                    console.debug(`Found longer state: ${longestStateLength}`);
                    console.debug(`Path: ${Array.from(state.seenNodes).join(' / ')} distance = ${state.distance}`);
                }
            }
        }

        console.log(`Longest Path: ${longestStateLength}`);
    });

type NodeState = {
    currentNode: string,
    seenNodes: Set<string>,
    distance: number;
}
function copyNodeState(s: NodeState) {
    return {
        currentNode: s.currentNode,
        seenNodes: new Set(s.seenNodes),
        distance: s.distance
    }
}

function getPathsFrom(gp: GridParser, p: Pair) {
    let states = new Array<State>();
    states.push({at: p, seen: new Set<string>(), finished: false});
    let toProcess = states.filter(s => !s.finished);
    while (toProcess.length) {
        //console.debug(`processing ${states.length} states (${toProcess.length} are unfinished)`)
        let state = toProcess.pop();
        let key = PairToKey(state.at);
        state.finished = state.seen.size > 0 && choke.has(key);
        state.seen.add(key);

        if (state.finished) continue;

        let neighbors = Array.from(gp.getNeighbors(key)).map(k => PairFromKey(k[0])).filter(p => gp.grid[p.y][p.x] !== '#')
            .filter(n => !state.seen.has(PairToKey(n)));

        if (neighbors.length === 0) {
            state.finished = true;
        } else {
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
    return states.map(s => Array.from(s.seen));
}