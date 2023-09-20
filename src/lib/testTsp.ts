import { TSP } from "./tsp.js";

let tests = Array<() => void>();

tests.push(() => {
    console.log('Basic tsp test');
    let tsp = new TSP();

    tsp.addSingleEdge('x1', 'x2', 5);
    tsp.addSingleEdge('x1', 'x3', 10);
    tsp.addSingleEdge('x1', 'x4', 16);
    tsp.addSingleEdge('x1', 'x5', 11);

    tsp.addSingleEdge('x2', 'x1', 9);
    tsp.addSingleEdge('x2', 'x3', 7);
    tsp.addSingleEdge('x2', 'x4', 12);

    tsp.addSingleEdge('x3', 'x1', 12);
    tsp.addSingleEdge('x3', 'x2', 5);
    tsp.addSingleEdge('x3', 'x4', 15);

    tsp.addSingleEdge('x4', 'x1', 15);
    tsp.addSingleEdge('x4', 'x2', 14);
    tsp.addSingleEdge('x4', 'x3', 9);
    tsp.addSingleEdge('x4', 'x5', 9);

    tsp.addSingleEdge('x5', 'x1', 9);
    tsp.addSingleEdge('x5', 'x4', 12);

    let paths = getPaths(tsp);
    // debugPaths(tsp, paths);
    assertPathCosts(tsp, paths, 30, 45, 48, 56);
});

tests.push(() => {
    console.log('Simple example with different shortest paths or cycles')
    let tsp = new TSP();
    tsp.addSingleEdge('a', 'b', 1);
    tsp.addSingleEdge('b', 'd', 1);
    tsp.addSingleEdge('b', 'c', 100);
    tsp.addSingleEdge('c', 'd', 200);
    tsp.addSingleEdge('d', 'c', 1);
    tsp.addSingleEdge('d', 'a', 300);

    let paths = getPaths(tsp);
    //debugPaths(tsp, paths);
    assertPathCosts(tsp, paths, 3, 601, 600, 601);
});

tests.push(() => {
    console.log('Another simple example with different shortest paths or cycles')
    let tsp = new TSP();
    tsp.addEdge('1', '2', 1);
    tsp.addEdge('2', '3', 1);
    tsp.addEdge('3', '4', 1);
    tsp.addEdge('1', '4', 100);
    tsp.addEdge('1', '3', 2);
    tsp.addEdge('2', '4', 2);

    let paths = getPaths(tsp);
    debugPaths(tsp, paths);//
    assertPathCosts(tsp, paths, 3, 6, 104, 105);
});

tests.push(() => {
    console.log('Another test from stackoverflow')
    let tsp = new TSP();
    tsp.addEdge('a', 'b', 1);
    tsp.addEdge('a', 'c', 2);
    tsp.addEdge('a', 'e', 1);
    tsp.addEdge('b', 'a', 1);
    tsp.addEdge('b', 'e', 1);
    tsp.addEdge('c', 'b', 3);
    tsp.addEdge('c', 'd', 1);
    tsp.addEdge('c', 'e', 2);
    tsp.addEdge('d', 'a', 4);
    tsp.addEdge('e', 'a', 1);
    tsp.addEdge('e', 'd', 2);

    let paths = getPaths(tsp);
    debugPaths(tsp, paths);//
    assertPathCosts(tsp, paths, 5, 7, 11, 12);
});

tests.forEach((f) => f());

function getPaths(tsp: TSP): { SP: Array<string>; SC: Array<string>; LP: Array<string>; LC: Array<string>; } {
    return {SP: tsp.getShortestPath(), SC: tsp.getShortestCycle(), LP: tsp.getLongestPath(), LC: tsp.getLongestCycle()};
}

function debugPaths(tsp: TSP, paths: { SP: Array<string>; SC: Array<string>; LP: Array<string>; LC: Array<string>; }) {
    console.log(`shortest path  = ${paths.SP} [${tsp.getShortestPathCost(paths.SP)}]`);
    console.log(`shortest cycle = ${paths.SC} [${tsp.getShortestPathCost(paths.SC)}]`);
    console.log(`longest path   = ${paths.LP} [${tsp.getShortestPathCost(paths.LP)}]`);
    console.log(`longest cycle  = ${paths.LC} [${tsp.getShortestPathCost(paths.LC)}]`);
}

function assertPathCosts(tsp: TSP, paths: { SP: Array<string>; SC: Array<string>; LP: Array<string>; LC: Array<string>; }, spCost: number, scCost: number, lpCost: number, lcCost: number) {
    console.assert(tsp.getShortestPathCost(paths.SP) === spCost, `Shortest path is ${spCost}`);
    console.assert(tsp.getShortestPathCost(paths.SC) === scCost, `Shortest cycle is ${scCost}`);
    console.assert(tsp.getLongestPathCost(paths.LP) === lpCost, `Longest path is ${lpCost}`);
    console.assert(tsp.getLongestPathCost(paths.LC) === lcCost, `Longest cycle is ${lcCost}`);

}
