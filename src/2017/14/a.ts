import { Cluster } from "../../lib/cluster.js";
import { Grid } from "../../lib/grid.js";
import { knotHash } from "../10/knotHash.js";

let grid = new Grid({x: 127, y: 127});
let input = 'hxtvlmkl'; // real input
//input='flqrgnkx'; // sample

for (let y=0; y<128; y++) {
    knotHash(`${input}-${y}`)
        .split('')
        .map((d) => Number('0x'+d).toString(2).padStart(4, '0').split(''))
        .flat()
        .forEach((b, ind) => grid.grid[y][ind] = (b==='1'));
}

let nodes = grid.getOn().map((p) => grid.toKey(p));
console.log(`Total used: ${nodes.length}`);
let cluster = new Cluster(nodes, (node) => grid.getNeighbors(node, true));
console.log(`Number of clusters ${cluster.sets.length}`);