import { Puzzle } from "../../lib/puzzle.js";
import { BFS } from "../../lib/bfs.js";

const p = new Puzzle();
const bfs = new BFS(getNeighbors);

const START = {x: 1, y: 1};
//*
const SEED = 1362; 
const END = {x: 31, y: 39};
/*/
const SEED = 10; 
const END = {x: 7, y: 4};
//*/

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

let path = bfs.getShortestPath(`${START.x},${START.y}`, `${END.x},${END.y}`);
path.forEach((p) => console.log(p));
console.log(`Path length: ${path.length}`);
