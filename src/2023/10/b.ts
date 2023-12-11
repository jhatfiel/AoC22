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
            visited.set(aConnection, 1);
        }

        console.debug(`Total visited: ${visited.size}, furthest away: ${Math.ceil(visited.size/2)}`)

        // once we have visited everything, set all locations to '.' if they haven't been visited (junk pipes)
        for (let y=0; y<grid.length; y++) {
            for (let x=0; x<grid[y].length; x++) {
                if (!visited.has(`${x},${y}`)) grid[y][x] = '.'
            }
        }
        debugGrid();

        // now find any location that has an odd number of horizontal pipes between it and the top/bottom
        // and an odd number of vertical pipes between it and the left/right
        let innerSize = 0;
        for (let y=0; y<grid.length; y++) {
            for (let x=0; x<grid[y].length; x++) {
                if (grid[y][x] === '.' && linesToBorder({x,y}) % 2 === 1) {
                    console.debug(`Inner position: ${x},${y}`)
                    innerSize++;
                    grid[y][x] = 'I'
                }
            }
        }

        console.debug(`Filled in 'inner' positions with I`);
        debugGrid();
        console.debug(`Inner Size: ${innerSize}`);
    });

function linesToBorder(pos: Pair): number {
    // check horizontal lines up to this row
    let lineCount = 0;
    let matchingPipe: Array<string> = new Array<string>();
    // count horizontal lines 
    //  - is one because it goes across
    for (let y=0; y<pos.y; y++) {
        let c = grid[y][pos.x];
        if (c === '-') lineCount++;
        if ('JF7L'.indexOf(c) !== -1) matchingPipe.push(c);
    }
    //  pairs of J and F go across
    //  pairs of 7 and L go across
    // I'm not really sure how this works, but it does.  I didn't think through all possibilities, but it worked in the sample & actual input so *shrugs
    while (matchingPipe.length) {
        let [a, b] = [matchingPipe.pop(), matchingPipe.shift()];
        console.debug(`Found: ${a}${b}`)
        if ('7L7_JFJ'.indexOf(`${a}${b}`) !== -1) lineCount++
    }

    //console.debug(`${JSON.stringify(pos)}, HlineCount=${lineCount}`);
    return lineCount;
}

function computePipeAt(curPos: Pair): string {
    let uConnection = '|7F'.indexOf(grid[curPos.y-1][curPos.x]) !== -1;
    let dConnection = '|LJ'.indexOf(grid[curPos.y+1][curPos.x]) !== -1;
    let lConnection = '-LF'.indexOf(grid[curPos.y][curPos.x-1]) !== -1;
    let rConnection = '-7J'.indexOf(grid[curPos.y][curPos.x+1]) !== -1;

    if (uConnection && dConnection) return '|';
    if (lConnection && rConnection) return '-';
    if (uConnection && rConnection) return 'L';
    if (rConnection && dConnection) return 'F';
    if (dConnection && lConnection) return '7';
    if (lConnection && uConnection) return 'J';
}

function findConnections(curPos: Pair): Set<string> {
    let result = new Set<string>();
    let char = grid[curPos.y][curPos.x];

    if ('|LJ'.indexOf(char) !== -1) result.add(`${curPos.x},${curPos.y-1}`);
    if ('-J7'.indexOf(char) !== -1) result.add(`${curPos.x-1},${curPos.y}`);
    if ('-LF'.indexOf(char) !== -1) result.add(`${curPos.x+1},${curPos.y}`);
    if ('|F7'.indexOf(char) !== -1) result.add(`${curPos.x},${curPos.y+1}`);

    return result;
}

function debugGrid() {
    grid.forEach(row => {
        console.debug(row.join(''))
    })

}