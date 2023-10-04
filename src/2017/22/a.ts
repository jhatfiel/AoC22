import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

const puzzle = new Puzzle(process.argv[2]);
const offset = 1000;
const maxCycles = 10000// 70;
let grid = new Grid({x: offset*2, y: offset*2});
let curPos: Pair = {x: 0, y: 0}
let row=0;

puzzle.onLine = (line) => {
    curPos.x = Math.floor(offset + line.length/2);
    curPos.y = Math.floor(offset + line.length/2);
    line.split('').forEach((c, ind) => grid.grid[offset+row][offset+ind] = c==='#');
    row++;
}

let directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];

puzzle.onClose = () => {
    let min = {x: offset, y: offset};
    let max = {x: offset+row, y: offset+row};

    let cycleCount = 0;
    let infectCount = 0;
    let dir = 0
    while (cycleCount < maxCycles) {
        console.log(`[${cycleCount.toString().padStart(5, ' ')}]: Current location: ${JSON.stringify(curPos)}, direction=${dir}`);
        //grid.debug(min, max);
        let c = grid.grid[curPos.y][curPos.x];
        // infected turns right +1 %4, else turn left +3 %4
        if (c) dir++;
        else dir += 3;
        dir %= 4;
        // clean or infect
        if (!c) infectCount++;
        grid.grid[curPos.y][curPos.x] = !grid.grid[curPos.y][curPos.x];
        // move forward
        curPos.x += directions[dir].x;
        curPos.y += directions[dir].y;
        if (curPos.x < min.x) min.x = curPos.x
        if (curPos.y < min.y) min.y = curPos.y
        if (curPos.x+1 > max.x) max.x = curPos.x+1
        if (curPos.y+1 > max.y) max.y = curPos.y+1
        cycleCount++;
    }
    console.log(`Infected: ${infectCount}`);
}

puzzle.run();