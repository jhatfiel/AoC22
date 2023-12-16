import { Pair } from "../../lib/grid.js";
import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

enum Direction { RIGHT, UP, LEFT, DOWN };
let moveDir = [
    {x: 1, y: 0},
    {x: 0, y: -1},
    {x: -1, y: 0},
    {x: 0, y: 1},
]

function makeKey(pos: Pair) { return `${pos.x},${pos.y}`; }

await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, []);

        console.log(`Total tiles energized (from 0,0): ${countEnergizedTiles(0, 0, Direction.RIGHT, gp)}`);

        let bestTotal = -Infinity;

        for (let x=0; x<gp.grid[0].length; x++) {
            let y = 0
            let result = countEnergizedTiles(x, y, Direction.DOWN, gp);
            if (result > bestTotal) {
                bestTotal = result;
            }
            y = gp.grid.length-1;
            result = countEnergizedTiles(x, y, Direction.UP, gp);
            if (result > bestTotal) {
                bestTotal = result;
            }
        }
        for (let y=0; y<gp.grid.length; y++) {
            let x = 0
            let result = countEnergizedTiles(x, y, Direction.RIGHT, gp);
            if (result > bestTotal) {
                bestTotal = result;
            }
            x = gp.grid.length-1;
            result = countEnergizedTiles(x, y, Direction.LEFT, gp);
            if (result > bestTotal) {
                bestTotal = result;
            }
        }
        console.log(`Best energizes: ${bestTotal}`);

    });

function countEnergizedTiles(x: number, y: number, initialDirection: Direction, gp: GridParser): number {
    let visited = new Map<string, Array<number>>();
    let beam = new Array<[Pair, Direction]>();
    beam.push([{x, y}, initialDirection]);

    for (let y=0; y<gp.grid.length; y++) {
        for (let x=0; x<gp.grid[0].length; x++) {
            visited.set(makeKey({x,y}), [0, 0, 0, 0]);
        }
    }

    while (beam.length) {
        //console.debug(`Processing ${beam.length} beams`);
        let newBeam = new Array<[Pair, Direction]>();
        beam.forEach(([pos, dir]) => {
            // visit the position
            let key = makeKey(pos);
            (visited.get(key))[dir]++;

            let c = gp.grid[pos.y][pos.x];
            //console.debug(`[${c}] - (${key}) pointing ${Direction[dir]}`);
            if ((c === '-' && (dir === Direction.DOWN || dir === Direction.UP)) ||
                (c === '|' && (dir === Direction.RIGHT || dir === Direction.LEFT))) {
                // split
                let newDir = (dir+1)%4;
                let newPos = {x: pos.x + moveDir[newDir].x, y: pos.y + moveDir[newDir].y}
                addIfExists(newPos, newDir, newBeam, visited);

                newDir = (newDir+2)%4;
                newPos = {x: pos.x + moveDir[newDir].x, y: pos.y + moveDir[newDir].y}
                addIfExists(newPos, newDir, newBeam, visited);
            } else {
                let newPos: Pair;
                let newDir: Direction;
                if        ((c === '/' && (dir === Direction.RIGHT || dir === Direction.LEFT)) ||
                        (c === '\\' && (dir === Direction.UP || dir === Direction.DOWN))) {
                    newDir = (dir+1)%4;
                    newPos = {x: pos.x + moveDir[newDir].x, y: pos.y + moveDir[newDir].y}
                } else if ((c === '\\' && (dir === Direction.RIGHT || dir === Direction.LEFT)) ||
                        (c === '/' && (dir === Direction.UP || dir === Direction.DOWN))) {
                    newDir = (dir+3)%4;
                    newPos = {x: pos.x + moveDir[newDir].x, y: pos.y + moveDir[newDir].y}
                } else {
                    // just move through
                    newDir = dir;
                    newPos = {x: pos.x + moveDir[dir].x, y: pos.y + moveDir[dir].y}
                }
                addIfExists(newPos, newDir, newBeam, visited);
            }
        })
        beam = newBeam;
    }
    let result = Array.from(visited.entries()).filter(pair => pair[1].some(count => count > 0)).length;
    return result;
}

function addIfExists(p: Pair, d: Direction, arr: Array<[Pair, Direction]>, map: Map<string, Array<number>>) {
    let key = makeKey(p);
    if (map.has(key) && (map.get(key))[d] === 0) {
        arr.push([p, d]);
    }
}