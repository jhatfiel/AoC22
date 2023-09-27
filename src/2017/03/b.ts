import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle();
let offset = 1000;
let grid = Array.from({length: offset*2}, () => new Array<number>(2*offset).fill(0));
let x = 0;
let y = 0;

let currentDirection = 3;
let directions = [[1,0], [0,-1], [-1,0], [0,1]];

let arr = [1, 12, 23, 1024, 277678]

let max = arr[arr.length-1];
let num = 1;

//max = 1000;

do {
    if (arr.indexOf(num) !== -1) { console.log(`${num} (${x},${y})`)}

    grid[offset+y][offset+x] = num;

    let nextDirection = directions[(currentDirection+1)%directions.length];
    if (grid[offset+y+nextDirection[1]][offset+x+nextDirection[0]]===0) currentDirection = (currentDirection+1)%directions.length;
    x += directions[currentDirection][0];
    y += directions[currentDirection][1];

    num = p.gridAroundP({x:offset+x, y:offset+y}, {x:2*offset, y:2*offset}).reduce((acc, point) => acc + grid[point.y][point.x], 0);

    //debug();
} while (num <= max)

console.log(`${num} (${x},${y})`);

function debug() {
    for (let y=-2; y<3; y++) {
        let line = '';
        for (let x=-2; x<3; x++) {
            line += grid[offset+y][offset+x].toString().padStart(3, ' ');
        }
        console.log(line);
    }
    console.log()
}