import { cross } from 'd3-array';
import { BFS } from '../../lib/bfs.js';

const TOP_FLOOR = 4;
const bfs = new BFS(getNeighbors);

class State {
    constructor(key: string) {
        this.floor = Number(key[0]);
        for (let i = 1; i < key.length; i+=2) {
            this.chips.push(Number(key[i]));
            this.gens.push(Number(key[i+1]));
        }
    }

    chips = new Array<number>();
    gens = new Array<number>();
    floor = 1;

    key() {
        let pieces = new Array<string>();
        this.chips.forEach((c, ind) => { pieces.push(`${c}${this.gens[ind]}`)})
        return [this.floor.toString(), ...pieces.sort()].join('');
    }

    isValid() {
        // if a chip exists on a floor without its corresponding generator (but with other generators), this is not valid
        return this.chips.every((kFloor, ind) => {
            //console.log(`Checking chip: ${k}/${kFloor}/${this.gens.get(k)}`);
            //console.log(`-- This floor's generators=${this.getFloorGenerators(kFloor).join(',')}`);
            if (kFloor === this.gens[ind]) return true; // if chip is with own generator, it's protected
            else return !this.floorHasGenerators(kFloor); // if chip is with other generator, it's fried
        }) && (this.chips.indexOf(this.floor) !== -1 || this.gens.indexOf(this.floor) !== -1) // the elevator better be somewhere with a component...
    }

    floorHasGenerators(cFloor: number) { return this.gens.indexOf(cFloor) !== -1; }
}

// wait, this is shortest path algorithm.  With a funny "neighbor" calculation (i.e., keep the state valid)
// I'm obviously missing some of the heuristic details here - probably should play with it some to get a better intuition
// Maybe I just need to solve using a VERY simple BFS instead of going the dijkstra route

let startKey = "1S11P11R22C22T32";
startKey = "1S11"; // 3 steps
startKey = "1S11P11"; // 15 steps (12 more)
startKey = "1S11P11R11"; // 27 steps (12 more)
startKey = "1S11P11R11C11"; // 39 steps (12 more)
startKey = "1S11P11R11C11T11"; // 51 steps (12 more)
// seems like every new combo you add on floor one adds 12 steps to the solution
startKey = '3S33'; // (duh, 1 step)
startKey = '3S33P33'; // 5 steps (4 more)
startKey = '3S33P33R33'; // 11 steps (6 more)
startKey = '3S33P33R33C33'; // 21 steps (10 more)
startKey = '3S33P33R33C33T33'; // 26 steps (5 more) (uh.....)
startKey = '1S11T32'; // 10 steps
startKey = '1S11C22T32'; // 18 steps
startKey = '1S11R22C22T32'; // 26 steps
startKey = '1S11P11R22C22T32'; // 37 steps (11 more)
//startKey = '1S11P11R22C22T32E11'; //  out of memory
startKey = '3S33'; // (duh, 1 step)
startKey = '3S33P33'; // 5 steps (4 more)
startKey = '3S33P33R33'; // 11 steps (6 more)
startKey = '3S33P33R33C33'; // 21 steps (10 more)
startKey = '1S11P11R22C22T32'; // 37 steps (11 more) 22 seconds for combination generation, 28 overall
startKey = '1S11P11R22C22T32'; // 8s overall now with BFS and calculating neighbors on the fly; 415,075 invalid nodes; 158,192 invalid nodes
startKey = '1S11P11R22C22T32E11'; // 49 steps, 1m42s; 3,785,655 invalid nodes; 989,821 visited
startKey = '1S11P11R22C22T32E11D11';

startKey = '3S33'; // (duh, 1 step)
startKey = '3S33P33'; // 5 steps (4 more)
startKey = '3S33P33R33'; // 11 steps (6 more)
startKey = '3S33P33R33C33'; // 21 steps (10 more)
startKey = '3S33P33R33C33T33'; // 25 steps (4 more) (uh.....)
startKey = '3S33P33R33C33T33E33'; // 29 steps (4 more)
startKey = '3S33P33R33C33T33E33D33'; // 33 steps (4 more)

startKey = '1S11T32R22C22'; // 25 steps; 1s; 38,592 invalid nodes; 22,359 visited
startKey = '1S11P11T32R22C22'; // 37 steps; 9s; 412,060 invalid nodes; 150,701 visited
startKey = '1S11P11T32R22C22E11'; // 49 steps; 1m33s; 3,770,202 invalid nodes; 956,130 visited
startKey = '1S11P11T32R22C22E11D11'; // still OOM
// 61 is correct, guessed just based on the pattern of +12 for everything that you add on floor 1

startKey = '111';
startKey = '11111';
startKey = '1111132';
startKey = '111113222';
startKey = '11111322222';
startKey = '1111132222211'; // 49 steps; <1s; 24,359 invalid, 8,117 visited
startKey = '111113222221111'; // 61 steps; <2s; 49,201 invalid, 14,655 visited

startKey = new State(startKey).key(); // get the sorted representation of the components

let startKinds = new Array<number>();
for (let ind=0; ind<(startKey.length-1)/2; ind++)
    startKinds.push(ind);
let endKey = '4' + startKinds.reduce((acc, k) => acc + '44', '');

let visited = new Set<string>();
let invalid = new Set<string>();
visited.add(startKey);

function getNeighbors(node: string): Set<string> {
    let result = new Set<string>();
    let floorFromStr = node[0];
    let floorFrom = Number(floorFromStr);
    let floorTo = new Array<number>();
    switch (floorFrom) {
        case 1: floorTo.push(2); break;
        case 2:
            if (node.indexOf('1') > -1) floorTo.push(1);
            floorTo.push(3);
            break;
        case 3:
            if (node.indexOf('1') > -1 || node.indexOf('2') > -1) floorTo.push(2);
            floorTo.push(4);
            break;
        case 4: floorTo.push(3); break;
        default: break;
    }
    let thisFloorPositions = new Array<number>();

    for (let i=1; i<node.length; i++) if (node[i] === floorFromStr) thisFloorPositions.push(i);

    // this gets us every combination of 2 positions for the current floor
    cross(thisFloorPositions, thisFloorPositions).forEach((arr) => {
        // we only care about positions that are equal or in ascending order (so that we don't try the same position twice)
        if (arr[0] <= arr[1]) {
            floorTo.forEach((to) => {
                let tryKey = to + node.slice(1, arr[0]) + to + node.slice(arr[0]+1);
                tryKey = tryKey.slice(0, arr[1]) + to + tryKey.slice(arr[1]+1);
                if (!visited.has(tryKey) && !invalid.has(tryKey)) {
                    let state = new State(tryKey);
                    let keyHash = state.key();
                    let valid = false;
                    if (!visited.has(keyHash) && !invalid.has(keyHash)) valid = state.isValid();
                    if (!valid) invalid.add(keyHash);
                    if (valid) {
                        result.add(keyHash);
                    }
                    visited.add(keyHash);
                    visited.add(tryKey);
                }
            })
        }
    })

    //console.log(`getNeighbors: Asking about ${node}, got ${Array.from(result.keys())} results`);
    return result;
}

let path = bfs.getShortestPath(startKey, endKey);
path?.forEach((c) => console.log(c));
console.log(`Fewest steps: ${path?.length}`);
console.log(`invalid size: ${invalid.size} / visited.size: ${visited.size}`);