import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

const puzzle = new Puzzle();
const GRID_SERIAL = 6303;
let grid = new Grid<number>({x: 300, y: 300});

let best = -Infinity;
let bestCoord = '';

for (let x=1; x<=300; x++) {
    for (let y=1; y<=300; y++) {
        let lastScore = 0;
        //console.debug(`${x},${y},${Math.min(300-y, 300-x)}`)
        for (let size=1; size<=Math.min(300-y, 300-x)+1; size++) {
            let score = 0;
            if (size === 1) {
                score = getValue(x, y);
            } else {
                score = lastScore
                for (let xd=0; xd<size-1; xd++) {
                    score += getValue(x+xd, y+size-1);
                }
                for (let yd=0; yd<size-1; yd++) {
                    score += getValue(x+size-1,y+yd);
                }
                score += getValue(x+size-1,y+size-1);
            }

            if (score > best) {
                best = score;
                bestCoord = `${x},${y},${size}`
                console.debug(`${bestCoord} ${best}`)
            }
            lastScore = score;
        }
    }
}
console.debug(`${bestCoord} ${best}`)

function calcBox(x: number, y: number, size: number) {
    let score = 0;
    //console.debug(`calcBox ${x} ${y} ${size}`)
    for (let xd=0; xd<size; xd++) {
        for (let yd=0; yd<size; yd++) {
            score += getValue(x+xd, y+yd);
        }
    }
    return score;
}

function getValue(x: number, y: number) {
    if (grid.grid[x][y] === undefined) {
        let rID = x+10;
        let p = Math.floor(((rID*y + GRID_SERIAL) * rID) / 100) % 10 - 5;
        grid.grid[x][y] = p;
    }
    //console.debug(`${x},${y} = ${grid.grid[x][y]}`)
    return grid.grid[x][y];
}