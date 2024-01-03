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
        let from = gp.toKey(gp.TL);
        let to   = gp.toKey(gp.BR);
        dij.compute(from, (node, distance) => {
            if (node.startsWith(to)) { to = node; distanceToEnd = distance; return true; }
            return false;
        });
        let paths = dij.pathTo(from, to, false);
        paths.forEach(path => console.debug(`path: ${path.join(' / ')}: Total Heat: ${distanceToEnd}`));
    });

    function getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        let [xStr, yStr, direction, distanceStr] = node.split(',');
        let x = Number(xStr);
        let y = Number(yStr);
        if (direction === undefined) direction = '';
        let distance = 0;
        if (distanceStr !== undefined) distance = Number(distanceStr);
        gp.gridOrthogonalP({x,y}).forEach(([p, d]) => {
            let dirKey = Direction[d].substring(0, 1);
            let reverseKey = Direction[(d+2)%4].substring(0, 1);
            let heat = Number(gp.grid[p.y][p.x]);
            if (direction === dirKey) {
                // can't take more than 3 steps in the same direction
                if (distance < 3) {
                    result.set(`${p.x},${p.y},${direction},${distance+1}`, heat);
                }
            } else {
                // going in a new direction
                // but can't go in the opposite direction!
                if (direction !== reverseKey) result.set(`${p.x},${p.y},${dirKey},1`, heat);
            }
        })
        return result;
    }