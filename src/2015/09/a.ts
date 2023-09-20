import { Puzzle } from "../../lib/puzzle.js";
import { TSP } from "../../lib/tsp.js";

const p = new Puzzle(process.argv[2]);

let tsp = new TSP();

p.onLine = (line) => {
    const arr = line.split(' ');
    console.log(line);
    tsp.addEdge(arr[0], arr[2], Number(arr[4]));
};

p.onClose = () => {
    let shortestPath = tsp.getShortestPath();

    console.log(`Shortest path length is ${tsp.getPathCost(shortestPath)}`);
};

p.run();