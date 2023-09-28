import { BFS } from "../../lib/bfs.js";
import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let bfs = new BFS(getNeighbors);
let connected = new Map<string, Set<string>>();

p.onLine = (line) => {
    let [name, connectedStr] = line.split(' <-> ');
    let arr = connectedStr.split(', ');
    connected.set(name, new Set(arr));
}

p.onClose = () => {
    let sizePod0 = 1;
    connected.forEach((_, name) => {
        let path = bfs.getShortestPath('0', name);
        if (path.length) sizePod0++;
    })
    console.log(`Number connected to 0: ${sizePod0}`);
}

p.run();

function getNeighbors(node: string): Set<string> {
    return connected.get(node);
}