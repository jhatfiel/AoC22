import { Dijkstra } from "../../lib/dijkstraBetter.js";
import { GridParser, Direction } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let gp: GridParser;

await puzzle.run()
    .then((lines: Array<string>) => {
        gp = new GridParser(lines, []);

        let dij = new Dijkstra(getNeighbors);

        let pathMap = dij.getShortestPaths(gp.toKey(gp.TL), false, node => !node.startsWith(gp.toKey(gp.BR)));
        //console.debug(`${Array.from(pathMap.keys()).join(' / ')}`);
        let finalNode = Array.from(pathMap.keys()).filter(n => n.startsWith(gp.toKey(gp.BR)))[0];
        let paths = pathMap.get(finalNode);
        paths.forEach(path => {
            console.debug(`path: ${path.join(' / ')}`);
            let totalHeat = 0;
            if (path.length > 1) {
                path.slice(1).forEach(piece => {
                    let [xStr, yStr, history] = piece.split(',');
                    let x = Number(xStr);
                    let y = Number(yStr);
                    let heat = Number(gp.grid[y][x]);
                    totalHeat += heat;
                })
            }
            console.log(`Total heat: ${totalHeat}`)
        })
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
        let heat = Number(gp.grid[y][x]);
        if (history.startsWith(dirKey)) {
            // can't take more than 3 steps in the same direction
            if (history.length < 3) {
                result.set(`${p.x},${p.y},${history}${dirKey}`, heat);
            }
        } else {
            // going in a new direction
            // but can't go in the opposite direction!
            if (!history.startsWith(reverseKey)) result.set(`${p.x},${p.y},${dirKey}`, heat);
        }
    })
    return result;
}
