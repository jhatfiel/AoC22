import { BFS } from "../../lib/bfs.js";
import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let connected = new Map<string, Set<string>>();
let bfs = new BFS(connected.get.bind(connected));

p.onLine = (line) => {
    let [name, connectedStr] = line.split(' <-> ');
    connected.set(name, new Set(connectedStr.split(', ')));
}

p.onClose = () => {
    let used = new Set<string>();
    let groups = 0;
    connected.forEach((_, from) => {
        if (!used.has(from)) {
            groups++;
            used.add(from);
            connected.forEach((_, to) => {
                if (!used.has(to)) { // don't check something that's already shown up in a group
                    let path = bfs.getShortestPath(from, to);
                    if (path.length) { used.add(to); }
                }
            });
        }
    })
    console.log(`Number of groups: ${groups}`)
}

p.run();