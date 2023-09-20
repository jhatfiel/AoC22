import { cross } from 'd3-array';
import { BFS } from '../../lib/bfs.js';

const TOP_FLOOR = 4;
const bfs = new BFS(getNeighbors);

class State {
    constructor(key: string) {
        this.floor = Number(key[0]);
        for (let i = 1; i < key.length; i+=3) {
            let k=key[i];
            this.chips.set(k, Number(key[i+1]));
            this.gens.set(k, Number(key[i+2]));
            this.kinds.push(k);
        }
    }

    chips = new Map<string, number>();
    gens = new Map<string, number>();
    floor = 1;
    kinds = new Array<string>();

    key() {
        let result = this.floor.toString();
        this.kinds.forEach((k) => { result += `${k}${this.chips.get(k)}${this.gens.get(k)}`})
        return result;
    }

    isEnd() {
        return this.kinds.every((k) => this.chips.get(k) === TOP_FLOOR && this.gens.get(k) === TOP_FLOOR);
    }

    isValid() {
        // if a chip exists on a floor without its corresponding generator (but with other generators), this is not valid
        return this.kinds.every((k) => {
            const kFloor = this.chips.get(k);
            //console.log(`Checking chip: ${k}/${kFloor}/${this.gens.get(k)}`);
            //console.log(`-- This floor's generators=${this.getFloorGenerators(kFloor).join(',')}`);
            if (this.chips.get(k) === this.gens.get(k)) return true; // if chip is with own generator, it's protected
            else return this.getFloorGenerators(kFloor).length === 0; // if chip is with other generator, it's fried
        }) &&
        this.kinds.some((k) => this.chips.get(k) === this.floor || this.gens.get(k) === this.floor) // the elevator better be somewhere with a component...
    }

    getFloorChips(cFloor: number): Array<string> {
        return Array.from(this.chips.entries()).filter((v) => v[1]===cFloor).map((v) => v[0]);
    }

    getFloorGenerators(cFloor: number): Array<string> {
        return Array.from(this.gens.entries()).filter((v) => v[1]===cFloor).map((v) => v[0]);
    }

    copy() {
        return new State(this.key());
    }
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
startKey = '1S11P11T32R22C22E11'; // 49 steps; 1m52s; 3,770,202 invalid nodes; 956,130 visited
startKey = '1S11P11T32R22C22E11D11'; // still OOM
// 61 is correct, guessed just based on the pattern of +12 for everything that you add on floor 1

// after correctly limiting search space to not include lower floors if there's nothing down there
startKey = '1S11T32'; // 9 steps;
//startKey = '1S11T32R22'; // 17 steps;
//startKey = '1S11T32R22C22'; // 25 steps; <1s; 38,592 invalid nodes; 22,359 visited
//startKey = '1S11P11T32R22C22'; // 37 steps; 7s; 412,060 invalid nodes; 150,701 visited
//startKey = '1S11P11T32R22C22E11'; // 49 steps; 1m52s; 3,770,202 invalid nodes; 956,130 visited
//startKey = '1S11P11T32R22C22E11D11'; // still OOM

let startKinds = startKey.replaceAll(/\d/g, '').split('');
let endKey = TOP_FLOOR.toString() + startKinds.reduce((acc, k) => acc + k + TOP_FLOOR.toString() + TOP_FLOOR.toString(), "");

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
            if (node.indexOf('1') > -1 || node.indexOf('2')) floorTo.push(2);
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
                let valid = !invalid.has(tryKey);
                if (!visited.has(tryKey) && !invalid.has(tryKey)) valid = new State(tryKey).isValid();
                if (!valid) invalid.add(tryKey);
                if (valid) {
                    visited.add(tryKey);
                    result.add(tryKey);
                }
            })
        }
    })

    console.log(`getNeighbors: Asking about ${node}, got ${Array.from(result.keys())} results`);
    return result;
}

let path = bfs.getShortestPath(startKey, endKey);
path?.forEach((c) => console.log(c));
console.log(`Fewest steps: ${path?.length}`);
console.log(`invalid size: ${invalid.size} / visited.size: ${visited.size}`);