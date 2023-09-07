import { Puzzle } from "../../lib/puzzle";
import { TSP } from "../../lib/tsp";

const p = new Puzzle(process.argv[2]);

let tsp = new TSP();

p.onLine = (line) => {
    const arr = line.split(' ');
    console.log(line);
    tsp.addEdge(arr[0], arr[2], Number(arr[4]));
};

p.onClose = () => {
    console.log();

    let shortestPath = tsp.getShortestPath();
    let longestPath = tsp.getLongestPath();

    console.log(`Shortest path length is ${tsp.getPathCost(shortestPath)}`);
    console.log(`Longest path length is ${tsp.getPathCost(longestPath)}`);
};

p.run();