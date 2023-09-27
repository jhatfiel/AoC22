import { BFS } from "../../lib/bfs.js";
import { Puzzle } from "../../lib/puzzle.js";
type Pair = {x: number, y: number};

let p = new Puzzle(process.argv[2]);
let grid = new Array<Array<boolean>>();
let bfs = new BFS(getNeighbors);
let goals = new Map<string, Pair>();
let start = {x:0, y:0};
let g2gDistance = new Map<string, Map<string, number>>();

p.onLine = (line) => {
    let arr = line.split('').map((c) => c==='#');
    let y=grid.length;

    let matches = line.matchAll(/[0-9]/g);

    for (const match of matches) {
        if (match[0] === '0') { start.x = match.index; start.y = y; }
        if ('0456'.indexOf(match[0]) !== -1) goals.set(match[0], {x: match.index, y})
    }

    grid.push(arr);
}
p.onClose = () => {
    goals.forEach((fPair, fName) => {
        let fKey = makeKey(fPair);
        let fMap = getOrCreateMap(g2gDistance, fName);
        goals.forEach((tPair, tName) => {
            if (fName < tName) {
                let tMap = getOrCreateMap(g2gDistance, tName);
                let tKey = makeKey(tPair);
                let path = bfs.getShortestPath(fKey, tKey);
                fMap.set(tName, path.length);
                tMap.set(fName, path.length);
            }
        });
    });

    let permutations = p.permute(Array.from(g2gDistance.get('0').keys()));
    console.log(`To Try: ${permutations.length}`);
    let bestDistance = Infinity;
    permutations.forEach((p) => {
        let path = p.split('');
        path.unshift('0');
        // path.push('0'); // part 2
        let prevNode = path[0];
        let thisDistance = path.reduce((acc, n) => { let d = acc + (g2gDistance.get(prevNode).get(n)??0); prevNode=n; return d;}, 0);
        if (thisDistance < bestDistance) {
            bestDistance = thisDistance;
            console.log(`${path}: ${thisDistance}`)
        }
    })

}
p.run();

function makeKey(p: Pair) { return `${p.x},${p.y}`;}
function isWall(p: Pair) { return grid[p.y][p.x]; }
function getOrCreateMap(map: Map<string, Map<string, number>>, key: string): Map<string, number> {
    let m = map.get(key);
    if (m === undefined) { m = new Map<string, number>(); map.set(key, m); }
    return m;
}
function getNeighbors(node: string): Set<string> {
    let result = new Set<string>();
    let [x, y] = node.split(',').map(Number);
    p.gridOrthogonalP({x,y}).forEach((p) => {
        if (!isWall(p)) result.add(`${p.x},${p.y}`);
    })
    return result;
}
