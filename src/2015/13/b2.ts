import { assert } from "console";
import { Puzzle } from "../../lib/puzzle.js";
import { TSP } from "../../lib/tsp.js";

const tsp = new TSP();

const p = new Puzzle(process.argv[2]);

let beside = new Map<string, Map<string, number>>();

p.onLine = (line) => {
    const arr = line.split(/[ \.]/);
    let change = (arr[2]==='gain')?Number(arr[3]):-1*Number(arr[3]);
    let a = arr[0];
    let b = arr[10];
    if (beside.get(b)?.get(a) !== undefined) {
        tsp.addEdge(a, b, beside.get(b)!.get(a)! + change);
    } else {
        if (!beside.has(a)) beside.set(a, new Map());
        beside.get(a)!.set(b, change);
    }
};

p.onClose = () => {
    tsp.nodes.forEach((n) => tsp.addEdge('u', n, 0));
    let path = tsp.getLongestPath();
    path.push(path[0]);
    console.log(`Result ${path} ${tsp.getLongestPathCost(path)}`);
};

p.run();