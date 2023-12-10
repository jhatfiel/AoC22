import { Pair } from "../../lib/grid.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let grid = new Array<Array<string>>();
let curPos: Pair = {x: 0, y: 0};
let visited = new Map<string, number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            if (line.indexOf('S') !== -1) {
                curPos.x = line.indexOf('S');
                curPos.y = grid.length;
            }
            grid.push(line.split(''));
        });

        visited.set(`${curPos.x},${curPos.y}`, 1);

        grid[curPos.y][curPos.x] = computePipeAt(curPos);
        console.debug(`Computed start: ${grid[curPos.y][curPos.x]}`);

        let connections = new Set<string>();
        while (Array.from((connections = findConnections(curPos)).keys()).filter(key => !visited.has(key)).length > 0) {
            let aConnection = Array.from(connections.keys()).filter(key => !visited.has(key))[0];
            [curPos.x, curPos.y] = aConnection.split(',').map(Number);
            console.debug(`Position: ${JSON.stringify(curPos)}, pipe: ${grid[curPos.y][curPos.x]}`)
            visited.set(aConnection, 1);
        }

        console.debug(`Total visited: ${visited.size}, furthest away: ${Math.ceil(visited.size/2)}`)
    });

function computePipeAt(curPos): string {
    let upConnections = findConnections({x: curPos.x, y: curPos.y-1});
    let downConnections = findConnections({x: curPos.x, y: curPos.y+1});
    let leftConnections = findConnections({x: curPos.x-1, y: curPos.y});
    let rightConnections = findConnections({x: curPos.x+1, y: curPos.y});

    let key = `${curPos.x},${curPos.y}`;

    if (upConnections.has(key) && downConnections.has(key)) return '|';
    if (leftConnections.has(key) && rightConnections.has(key)) return '-';
    if (rightConnections.has(key) && upConnections.has(key)) return 'L';
    if (leftConnections.has(key) && upConnections.has(key)) return 'J';
    if (rightConnections.has(key) && downConnections.has(key)) return 'F';
    if (leftConnections.has(key) && downConnections.has(key)) return '7';
}

function findConnections(curPos: Pair): Set<string> {
    let result = new Set<string>();
    let char = grid[curPos.y][curPos.x];
    /*
    // up
    if ('|LJ'.indexOf(char) !== -1
     && !visited.has({x: curPos.x, y: curPos.y-1}) 
     && '7|F'.indexOf(grid[curPos.y-1][curPos.x]) !== -1) result.push({x: curPos.x, y: curPos.y-1})
     // left
    if ('-J7'.indexOf(char) !== -1
     && !visited.has({x: curPos.x-1, y: curPos.y}) 
     && '7|F'.indexOf(grid[curPos.y-1][curPos.x]) !== -1) result.push({x: curPos.x, y: curPos.y-1})
     // right
     // down
     */

    if ('|LJ'.indexOf(char) !== -1) result.add(`${curPos.x},${curPos.y-1}`);
    if ('-J7'.indexOf(char) !== -1) result.add(`${curPos.x-1},${curPos.y}`);
    if ('-LF'.indexOf(char) !== -1) result.add(`${curPos.x+1},${curPos.y}`);
    if ('|F7'.indexOf(char) !== -1) result.add(`${curPos.x},${curPos.y+1}`);

    return result;
}