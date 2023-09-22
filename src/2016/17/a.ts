import { BFS } from "../../lib/bfs.js";
import pkg from 'spark-md5';
const { hash } = pkg;

const bfs = new BFS(getNeighbors);

const PASSCODE = ['ihgpwlah', 'kglvqrro', 'ulqzkmiv', 'hhhxzeay'][3];
// node will be x,y,HISTORY because the door statuses will change every single time you move

const START = '0,0,'
const END = '3,3,'

let shortest = ''
let longest = 0;

function getNeighbors(node: string): Set<string> {
    let result = new Set<string>();
    let arr = node.split(',');
    let [x, y] = arr.slice(0,2).map(Number);
    let history = arr[2];
    if (x===3 && y===3) {
        if (shortest.length === 0) {
            shortest = history;
            console.log(`Found shortest: ${history}`);
        }
        if (history.length > longest) {
            longest = history.length;
            console.log(`Found end: ${history.length}`);
        }
    } else {
        let hex = hash(PASSCODE + history);
        // up, down, left, right
        // bcdef is open
        // 0-a is open, b-f is closed
        if ('bcdef'.indexOf(hex[0]) > -1 && y > 0) result.add(`${x},${y-1},${history}U`);
        if ('bcdef'.indexOf(hex[1]) > -1 && y < 3) result.add(`${x},${y+1},${history}D`);
        if ('bcdef'.indexOf(hex[2]) > -1 && x > 0) result.add(`${x-1},${y},${history}L`);
        if ('bcdef'.indexOf(hex[3]) > -1 && x < 3) result.add(`${x+1},${y},${history}R`);
    }
    //console.log(`Asking about ${node}, ${x},${y} [${PASSCODE}${history}] - results = ${Array.from(result).join('/')}`)

    return result;
}

const path = bfs.getShortestPath(START, `KEEPGOING`);
path.forEach((n) => console.log(n));
console.log(`Shortest path: ${shortest}`);
console.log(`Maximum path length: ${longest}`)