import { TSP } from "./tsp";

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

/*
console.log(`x2/[x2] cost = ${tsp.getMinCost('x2', new Set(['x2']))}`);
console.log(`x3/[x3] cost = ${tsp.getMinCost('x3', new Set(['x3']))}`);
console.log(`x4/[x4] cost = ${tsp.getMinCost('x4', new Set(['x4']))}`);
console.log(`x5/[x5} cost = ${tsp.getMinCost('x5', new Set(['x5']))}`);

console.log(`x2/[x2,x3] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x3']))}`)
console.log(`x3/[x2,x3] cost = ${tsp.getMinCost('x3', new Set(['x2', 'x3']))}`)
console.log(`x2/[x2,x4] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x4']))}`)
console.log(`x4/[x2,x4] cost = ${tsp.getMinCost('x4', new Set(['x2', 'x4']))}`)
console.log(`x2/[x2,x5] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x5']))}`)
console.log(`x5/[x2,x5] cost = ${tsp.getMinCost('x5', new Set(['x2', 'x5']))}`)
console.log(`x3/[x3,x4] cost = ${tsp.getMinCost('x3', new Set(['x3', 'x4']))}`)
console.log(`x4/[x3,x4] cost = ${tsp.getMinCost('x4', new Set(['x3', 'x4']))}`)
console.log(`x3/[x3,x5] cost = ${tsp.getMinCost('x3', new Set(['x3', 'x5']))}`)
console.log(`x5/[x3,x5] cost = ${tsp.getMinCost('x5', new Set(['x3', 'x5']))}`)
console.log(`x4/[x4,x5] cost = ${tsp.getMinCost('x4', new Set(['x4', 'x5']))}`)
console.log(`x5/[x4,x5] cost = ${tsp.getMinCost('x5', new Set(['x4', 'x5']))}`)

console.log(`x2/[x2,x3,x4] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x3', 'x4']))}`)
console.log(`x3/[x2,x3,x4] cost = ${tsp.getMinCost('x3', new Set(['x2', 'x3', 'x4']))}`)
console.log(`x4/[x2,x3,x4] cost = ${tsp.getMinCost('x4', new Set(['x2', 'x3', 'x4']))}`)
console.log(`x2/[x2,x3,x5] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x3', 'x5']))}`)
console.log(`x3/[x2,x3,x5] cost = ${tsp.getMinCost('x3', new Set(['x2', 'x3', 'x5']))}`)
console.log(`x5/[x2,x3,x5] cost = ${tsp.getMinCost('x5', new Set(['x2', 'x3', 'x5']))}`)
console.log(`x2/[x2,x4,x5] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x4', 'x5']))}`)
console.log(`x4/[x2,x4,x5] cost = ${tsp.getMinCost('x4', new Set(['x2', 'x4', 'x5']))}`)
console.log(`x5/[x2,x4,x5] cost = ${tsp.getMinCost('x5', new Set(['x2', 'x4', 'x5']))}`)
console.log(`x3/[x3,x4,x5] cost = ${tsp.getMinCost('x3', new Set(['x3', 'x4', 'x5']))}`)
console.log(`x4/[x3,x4,x5] cost = ${tsp.getMinCost('x4', new Set(['x3', 'x4', 'x5']))}`)
console.log(`x5/[x3,x4,x5] cost = ${tsp.getMinCost('x5', new Set(['x3', 'x4', 'x5']))}`)

console.log(`x2/[x2,x3,x4,x5] cost = ${tsp.getMinCost('x2', new Set(['x2', 'x3', 'x4', 'x5']))}`)
console.log(`x3/[x2,x3,x4,x5] cost = ${tsp.getMinCost('x3', new Set(['x2', 'x3', 'x4', 'x5']))}`)
console.log(`x4/[x2,x3,x4,x5] cost = ${tsp.getMinCost('x4', new Set(['x2', 'x3', 'x4', 'x5']))}`)
console.log(`x5/[x2,x3,x4,x5] cost = ${tsp.getMinCost('x5', new Set(['x2', 'x3', 'x4', 'x5']))}`)
*/

/*
let path = tsp.getShortestPath();
path.push(path[0]);
console.log(`shortest path = ${path}`);
let cost = tsp.getShortestPathCost(path);
console.log(`shortest path = ${path} ${cost}`);

path = tsp.getLongestPath();
path.push(path[0]);
console.log(`longest path = ${path}`);
cost = tsp.getLongestPathCost(path);
console.log(`longest path = ${path} ${cost}`);
*/

/* obviously wrong - longestpath isn't longest!
shortest path = x4,x5,x1,x2,x3,x4
shortest path = x4,x5,x1,x2,x3,x4 45
longest path = x2,x3,x4,x1,x5,x2
longest path = x2,x3,x4,x1,x5,x2 65
 */

let path = tsp.getShortestPath();
path.push(path[0]);
console.log(`min cost = ${tsp.getShortestPathCost(path)}`)

path = tsp.getLongestPath();
path.push(path[0]);
console.log(`max cost = ${tsp.getLongestPathCost(path)}`)

/*

let shortest = Infinity;
let shortestPath = [''];
let longest = 0;
let longestPath = [''];

for (let a=1; a<6; a++) {
for (let b=1; b<6; b++) { if (b === a) continue;
for (let c=1; c<6; c++) { if (c === a || c === b) continue;
for (let d=1; d<6; d++) { if (d === a || d === b || d === c) continue;
for (let e=1; e<6; e++) { if (e === a || e === b || e === c || e === d) continue;
    let p=[`x${a}`, `x${b}`, `x${c}`, `x${d}`, `x${e}`, `x${a}`];
    let s=tsp.getPathCost(p);
    let l=tsp.getPathCost(p);
    if (s < shortest) {
        shortest = s;
        shortestPath = p;
    }
    if (l > longest) {
        longest = l;
        longestPath = p;
    }
}
}
}
}
}

console.log(`calculated shortest = ${shortestPath} ${shortest}`);
console.log(`calculated longest = ${longestPath} ${longest}`);

console.log(`real shortest: ${tsp.getPathCost(['x1', 'x2', 'x3', 'x4', 'x5', 'x1'])}`)
console.log(`real longest: ${tsp.getPathCost(['x1', 'x5', 'x2', 'x3', 'x4', 'x1'])}`)
*/