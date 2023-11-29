import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

const puzzle = new Puzzle();
const GRID_SERIAL = 6303;
let grid = new Grid<number>({x: 300, y: 300});

let best = -Infinity;
let bestCoord = '';

for (let x=1; x<299; x++) {
    for (let y=1; y<299; y++) {
        let score = calcBox(x, y)
        if (score > best) {
            best = score;
            bestCoord = `${x},${y}`
        }
    }
}
console.log(`${bestCoord} ${best}`)

function calcBox(x: number, y: number) {
    return getValue(x, y) + getValue(x+1, y) + getValue(x+2, y) + 
           getValue(x, y+1) + getValue(x+1, y+1) + getValue(x+2, y+1) + 
           getValue(x, y+2) + getValue(x+1, y+2) + getValue(x+2, y+2);

}

function getValue(x: number, y: number) {
    if (grid.grid[x][y] === undefined) {
        let rID = x+10;
        let p = Math.floor(((rID*y + GRID_SERIAL) * rID) / 100) % 10 - 5;
        grid.grid[x][y] = p;
    }
    return grid.grid[x][y];
}