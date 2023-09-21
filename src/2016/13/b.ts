import { Puzzle } from "../../lib/puzzle.js";
import { BFS } from "../../lib/bfs.js";

const p = new Puzzle();

const START = {x: 1, y: 1};
const MAX_STEPS = 50; // 50;
const SEED = 1362; 

type Pair = {x: number, y: number};

function debug(clear=false) {
    for (let y=0; y<=6; y++) {
        let line = '';
        for (let x=0; x<10; x++) {
            line += isWall({x,y})?'#':'.'
        }
        console.log(line);
    }
}

function isWall(p: Pair) {
    const num = p.x*p.x+3*p.x+2*p.x*p.y+p.y+p.y*p.y + SEED;
    return num.toString(2).split('').reduce((acc, b) => acc + ((b==='1')?1:0), 0) % 2 === 1;
}

function getNeighbors(node: string): Set<string> {
    let result = new Set<string>();
    let [x, y] = node.split(',').map(Number);
    p.gridOrthogonalP({x,y}).forEach((p) => {
        if (!isWall(p)) result.add(`${p.x},${p.y}`);
    })
    return result;
}

debug();

let visited = new Set<string>();
let newnode = new Set<string>();
visited.add(`${START.x},${START.y}`);
newnode.add(`${START.x},${START.y}`);

for (let iteration=0; iteration<=MAX_STEPS; iteration++) {
    let _newnode = new Set<string>();
    console.log(`Iteration: ${iteration}: visited.size=${visited.size}`);//: ${Array.from(visited.keys()).join('/')}`);

    newnode.forEach((n) => {
        getNeighbors(n).forEach((v) => {
            if (!visited.has(v) && !newnode.has(v)) _newnode.add(v);
            visited.add(v);
        })
    })

    newnode = _newnode;
}