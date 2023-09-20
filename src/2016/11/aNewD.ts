import { cross } from 'd3-array';
import Graph from 'node-dijkstra'
const route = new Graph();
const TOP_FLOOR = 4;

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

/* 
// Simple
//let startKey = '1L11';
//let startKinds = Array.from(['L']);
//let endKey = '4L44';
// Sample
let startKey = '1L13H13';
let startKinds = Array.from(['L', 'H']);
let endKey = '4L44H44';
/*/
// Input
let startKey = "1S11P11R22C22T32";
let startKinds = Array.from(['S', 'P', 'R', 'C', 'T']);
let endKey = "4S44P44R44C44T44";
//*/

console.log(`Creating combinations`);
console.time('combinations');
let floorsArray = Array.from({length: TOP_FLOOR}, (_, i) => i+1);
let floorCombinations = cross(floorsArray, floorsArray, (a, b) => a.toString()+b.toString());
let combinations = [...floorsArray.map((f) => f.toString())];
startKinds.forEach((k) => combinations = cross(combinations, floorCombinations, (a, b) => a.toString()+k+b))
let validKeys = new Set<string>();
combinations.forEach((c) => {
    if (new State(c).isValid()) validKeys.add(c);
});
console.timeEnd('combinations');
console.log(`Combinations length: ${validKeys.size}`);
console.time('buildroute');
validKeys.forEach((c) => route.addNode(c, Object.fromEntries(getNeighbors(c))))
console.timeEnd('buildroute');

function getNeighbors(node: string): Map<string, number> {
    let result = new Map<string, number>();
    let floorFromStr = node[0];
    let floorFrom = Number(floorFromStr);
    let floorTo = new Array<number>();
    if (floorFrom > 1) floorTo.push(floorFrom-1);
    if (floorFrom < TOP_FLOOR) floorTo.push(floorFrom+1);
    let thisFloorPositions = new Array<number>();

    for (let i=1; i<node.length; i++) if (node[i] === floorFromStr) thisFloorPositions.push(i);

    // this gets us every combination of 2 positions for the current floor
    cross(thisFloorPositions, thisFloorPositions).forEach((arr) => {
        // we only care about positions that are equal or in ascending order (so that we don't try the same position twice)
        if (arr[0] <= arr[1]) {
            floorTo.forEach((to) => {
                // we should never take a generator down a level?
                //if (((arr[0]-1)%3 !== 2 || to >= Number(node[arr[0]])) && 
                    //((arr[1]-1)%3 !== 2 || to >= Number(node[arr[1]]))) {
                    let tryKey = to + node.slice(1, arr[0]) + to + node.slice(arr[0]+1);
                    tryKey = tryKey.slice(0, arr[1]) + to + tryKey.slice(arr[1]+1);
                    /*
                    let state = new State(tryKey);
                    if (state.isValid()) result.set(tryKey, 1);
                    */
                    if (validKeys.has(tryKey)) result.set(tryKey, 1);
                //}
            })
        }
    })

    //console.log(`getNeighbors: Asking about ${node}, got ${result.size} results`);
    return result;
}

let path = route.path(startKey, endKey);
console.log(path.join('/'));
console.log(`Fewest steps: ${path.length}`);