import { BFS } from "../../lib/bfs.js";
import { Dijkstra } from "../../lib/dijkstra.js";
import { GridParser, Pair, Direction } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let gp: GridParser;

await puzzle.run()
    .then((lines: Array<string>) => {
        gp = new GridParser(lines, []);

        let dij = new Dijkstra(getNeighbors);

        for (let x=0; x<gp.width; x++) {
            for (let y=0; y<gp.height; y++) {
                dij.addNode(gp.toKey({x, y}));

                for (let n=1; n<=10; n++) {
                    dij.addNode(gp.toKey({x, y}) + ',' + 'U'.padStart(n, 'U'));
                    dij.addNode(gp.toKey({x, y}) + ',' + 'R'.padStart(n, 'R'));
                    dij.addNode(gp.toKey({x, y}) + ',' + 'L'.padStart(n, 'L'));
                    dij.addNode(gp.toKey({x, y}) + ',' + 'D'.padStart(n, 'D'));
                }
            }
        }

        // > 20 minutes to run...
        let path = dij.getShortestPath(gp.toKey(gp.TL), gp.toKey(gp.BR));
        console.debug(path);
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
        totalHeat += Number(gp.grid[gp.height-1][gp.width-1])
        console.log(`Total heat: ${totalHeat}`)
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
            // can't take more than 10 steps in the same direction
            if (history.length <= 10) {
                if (p.x === gp.BR.x && p.y === gp.BR.y) {
                    result.set(`${p.x},${p.y}`, heat);
                }
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
                    if (p.x === gp.BR.x && p.y === gp.BR.y) {
                        result.set(`${p.x},${p.y}`, heat);
                    }
                }
            }
        }
    })
    return result;
}
