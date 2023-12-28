import { Dijkstra } from "../../lib/dijkstraBetter.js";
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
        //console.debug(`${Array.from(pathMap.keys()).join(' / ')}`);
        let finalNode = Array.from(pathMap.keys()).filter(n => n.startsWith(gp.toKey(gp.BR)))[0];
        let paths = pathMap.get(finalNode);
        paths.forEach(path => console.debug(`path: ${path.join(' / ')}: Total Heat: ${distanceToEnd}`));
    });

function getNeighbors(node: string): Map<string, number> {
    let result = new Map<string, number>();
    let [xStr, yStr, history] = node.split(',');
    let x = Number(xStr);
    let y = Number(yStr);
    if (history === undefined) history = '';
    gp.gridOrthogonalP({x,y}).forEach(([p, d]) => {
        let dirKey = Direction[d].substring(0, 1);
        let reverseKey = Direction[(d+2)%4].substring(0, 1);
        let heat = Number(gp.grid[p.y][p.x]);
        if (history.startsWith(dirKey)) {
            // can't take more than 10 steps in the same direction
            if (history.length < 10) {
                result.set(`${p.x},${p.y},${history}${dirKey}`, heat);
            }
        } else {
            if (node === '0,0') {
                // fine, go anywhere from the start
                result.set(`${p.x},${p.y},${dirKey}`, heat);
            } else {
                // can't change directions if we were going the previous direction less than 4 times!
                if (history.length >= 4) {
                    // going in a new direction
                    // but can't go in the opposite direction!
                    if (!history.startsWith(reverseKey)) result.set(`${p.x},${p.y},${dirKey}`, heat);
                }
            }
        }
    })
    return result;
}
