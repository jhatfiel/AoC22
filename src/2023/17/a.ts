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

                dij.addNode(gp.toKey({x, y}) + `,U`);
                dij.addNode(gp.toKey({x, y}) + `,UU`);
                dij.addNode(gp.toKey({x, y}) + `,UUU`);
                dij.addNode(gp.toKey({x, y}) + `,R`);
                dij.addNode(gp.toKey({x, y}) + `,RR`);
                dij.addNode(gp.toKey({x, y}) + `,RRR`);
                dij.addNode(gp.toKey({x, y}) + `,L`);
                dij.addNode(gp.toKey({x, y}) + `,LL`);
                dij.addNode(gp.toKey({x, y}) + `,LLL`);
                dij.addNode(gp.toKey({x, y}) + `,D`);
                dij.addNode(gp.toKey({x, y}) + `,DD`);
                dij.addNode(gp.toKey({x, y}) + `,DDD`);
            }
        }

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
        console.log(`Total heat: ${totalHeat}`)
    });

function getNeighbors(node: string): Map<string, number> {
    let result = new Map<string, number>();
    let [xStr, yStr, history] = node.split(',');
    let x = Number(xStr);
    let y = Number(yStr);
    if (x === gp.BR.x && y === gp.BR.y) {
        result.set(`${x},${y}`, 0);
        return result;
    }
    if (history === undefined) history = '';
    gp.gridOrthogonalP({x,y}).forEach(([p, d]) => {
        let dirKey = Direction[d].substring(0, 1);
        let reverseKey = Direction[(d+2)%4].substring(0, 1);
        if (history.startsWith(dirKey)) {
            // can't take more than 3 steps in the same direction
            if (history.length < 3) {
                result.set(`${p.x},${p.y},${history}${dirKey}`, Number(gp.grid[y][x]));
            }
        } else {
            // going in a new direction
            // but can't go in the opposite direction!
            if (!history.startsWith(reverseKey)) result.set(`${p.x},${p.y},${dirKey}`, Number(gp.grid[y][x]));
        }
    })
    return result;
}
