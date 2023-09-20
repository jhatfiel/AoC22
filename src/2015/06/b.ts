import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let grid: Array<Array<number>> = Array.from({length:1000}, () => new Array<number>(1000).fill(0));

p.onLine = (line) => {
    console.log(line);
    let arr = line.split(' ');
    let delta = 2;

    if (line.startsWith('turn on') || line.startsWith('turn off')) {
        arr.shift();
        delta = (arr[0] === 'on')?1:-1;
    }

    let [top, left] = arr[1].split(',').map(Number);
    let [bottom, right] = arr[3].split(',').map(Number);
    for (let row=top; row<=bottom; row++) {
        for (let col=left; col<=right; col++) {
            grid[row][col] = Math.max(0, grid[row][col]+delta);
        }
    }

};

let debug = () => {
}

p.onClose = () => {
    let sum = grid.reduce((s, arr) => s + arr.reduce((s2, v) => s2+v, 0), 0);
    console.log(`Total brightness: ${sum}`);
};

p.run();