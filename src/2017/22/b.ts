import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

const puzzle = new Puzzle(process.argv[2]);
const offset = 1000;
const maxCycles = 10000000;
// 100 bursts, 26 will result in infection. 
// Unfortunately, another feature of this evolved virus is speed; of the first 10000000 bursts, 2511944 will result in infection.
let grid = new Grid<number>({x: offset*2, y: offset*2}, 0);
let curPos: Pair = {x: 0, y: 0}
let row=0;

puzzle.onLine = (line) => {
    curPos.x = Math.floor(offset + line.length/2);
    curPos.y = Math.floor(offset + line.length/2);
    line.split('').forEach((c, ind) => grid.grid[offset+row][offset+ind] = c==='#'?2:0);
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
        //grid.debug(min, max);
        let c = grid.grid[curPos.y][curPos.x];
        if (cycleCount % 10000 === 0) console.log(`[${cycleCount.toString().padStart(8, ' ')}]: Current location: ${JSON.stringify(curPos)}=${c}, direction=${dir}`);
        // cycle of states
        // clean = 0 (left)
        // weakened = 1 (straight)
        // infected = 2 (right)
        // flagged = 3 (reverse)
        switch (c) {
            case 0:
                dir += 3;
                break;
            case 1:
                break;
            case 2:
                dir++;
                break;
            case 3:
                dir += 2;
                break;
        }
        dir %= 4;
        c++;
        c %= 4;
        if (c === 2) infectCount++;
        grid.grid[curPos.y][curPos.x] = c;
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