import { BFS } from "../../lib/bfs.js";
import { Puzzle } from "../../lib/puzzle.js";
import { TSP } from "../../lib/tsp.js";

// TSP of BFS-discovered distances?
// force the TSP to start and end at 0
type Pair = {x: number, y: number};

let p = new Puzzle(process.argv[2]);
let grid = new Array<Array<boolean>>();
let bfs = new BFS(getNeighbors);
let tsp = new TSP();
let goals = new Map<string, Pair>();
let start = {x:0, y:0};

p.onLine = (line) => {
    let arr = line.split('').map((c) => c==='#');
    let y=grid.length;

    let matches = line.matchAll(/[0-9]/g);

    for (const match of matches) {
        if (match[0] === '0') { start.x = match.index; start.y = y; }
        else { goals.set(match[0], {x: match.index, y}) }
    }

    grid.push(arr);
}
p.onClose = () => {
    let sKey = makeKey(start);
    goals.forEach((fPair, fName) => {
        let fKey = makeKey(fPair);
        let path = bfs.getShortestPath(sKey, fKey);
        //console.log(`Shortest from start to goal ${fName} ${path.length}`);
        tsp.addSingleEdge('0', fName, path.length);
        tsp.addSingleEdge(fName, 'E', path.length);
        goals.forEach((tPair, tName) => {
            if (fName < tName) {
                let tKey = makeKey(tPair);
                path = bfs.getShortestPath(fKey, tKey);
                tsp.addEdge(fName, tName, path.length);
                //console.log(`${fName} ${tName} ${path.length}`)
            }
        });
    });

    let path = tsp.getShortestPath();
    console.log(`Path: ${path} Cost: ${tsp.getShortestPathCost(path)}`);

}
p.run();

function makeKey(p: Pair) { return `${p.x},${p.y}`;}
function isWall(p: Pair) { return grid[p.y][p.x]; }
function getNeighbors(node: string): Set<string> {
    let result = new Set<string>();
    let [x, y] = node.split(',').map(Number);
    p.gridOrthogonalP({x,y}).forEach((p) => {
        if (!isWall(p)) result.add(`${p.x},${p.y}`);
    })
    return result;
}
