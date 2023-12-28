import { Dijkstra } from "../../lib/dijkstraBetter.js";
import { PairMove } from "../../lib/gridParser.js";
import { PAIR_LEFT, PAIR_RIGHT } from "../../lib/gridParser.js";
import { GridParser, Direction } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let gp: GridParser;

await puzzle.run()
    .then((lines: Array<string>) => {
        gp = new GridParser(lines, []);

        let dij = new Dijkstra(getNeighbors);

        let distanceToEnd = Infinity;
        let pathMap = dij.getShortestPaths(gp.toKey(gp.TL), false, (node, distance) => {
                if (node.startsWith(gp.toKey(gp.BR))) { distanceToEnd = distance; return true; }
                return false;
            }, node => node.startsWith(gp.toKey(gp.BR)));
        let finalNode = Array.from(pathMap.keys()).filter(n => n.startsWith(gp.toKey(gp.BR)))[0];
        let paths = pathMap.get(finalNode);
        paths.forEach(path => console.debug(`path: ${path.join(' / ')}: Total Heat: ${distanceToEnd}`));
    });

function getNeighbors(node: string): Map<string, number> {
    let result = new Map<string, number>();
    let [xStr, yStr, history] = node.split(',');
    let x = Number(xStr);
    let y = Number(yStr);

    const maxStepLength = 3;
    let facing = [history];
    if (history === undefined) facing = ['R', 'D'];

    facing.forEach(d => {
        let p = {x, y};
        let pLeft = {x, y};
        let pLeftDir = PAIR_LEFT.get(d);
        PairMove(pLeft, pLeftDir);
        let pRight = {x, y}; 
        let pRightDir = PAIR_RIGHT.get(d);
        PairMove(pRight, pRightDir);
        let pDistance = 0;
        for (let i=0; i<maxStepLength; i++) {
            if (gp.valid(pLeft)) {
                result.set(`${pLeft.x},${pLeft.y},${pLeftDir}`, pDistance + Number(gp.grid[pLeft.y][pLeft.x]));
                PairMove(pLeft, d);
            }
            if (gp.valid(pRight)) {
                result.set(`${pRight.x},${pRight.y},${pRightDir}`, pDistance + Number(gp.grid[pRight.y][pRight.x]));
                PairMove(pRight, d);
            }

            PairMove(p, d);
            if (gp.valid(p)) pDistance += Number(gp.grid[p.y][p.x]);
            else break;
        }
    })
    //console.debug(`From: ${node} neighbors are: `, JSON.stringify(Object.fromEntries(result)));
    return result;
}
