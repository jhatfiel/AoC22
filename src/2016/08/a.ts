import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);
const NUM_ROWS = 6;
const NUM_COLS = 50;
let cnt = 0;
let grid = Array.from({length: NUM_ROWS}, () => new Array<boolean>(NUM_COLS).fill(false));

console.log(`Initial:`);
debug(1000);

p.onLine = (line) => {
    console.log(line);
    const arr = line.split(/ /);
    if (arr[0] === 'rect') {
        let [cols, rows] = arr[1].split('x').map(Number);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                grid[row][col] = true;
            }
        }
    } else if (arr[0] === 'rotate' && arr[1] === 'row') {
        const row = Number(arr[2].split('=')[1]);
        const by = Number(arr[4]);
        const oldRow = grid[row];
        let newRow = new Array<boolean>(NUM_COLS).fill(false);
        oldRow.forEach((b, ind) => newRow[(ind+by)%NUM_COLS] = b);
        grid[row] = newRow;
    } else if (arr[0] === 'rotate' && arr[1] === 'column') {
        const col = Number(arr[2].split('=')[1]);
        const by = Number(arr[4]);
        const oldCol = grid.map((row) => row[col]);
        const newCol = new Array<boolean>(NUM_ROWS).fill(false);
        oldCol.forEach((b, ind) => newCol[(ind+by)%NUM_ROWS] = b);
        grid.forEach((row, ind) => row[col] = newCol[ind]);
    }

    debug(0*1000);
};

function debug(waitTime: number, clear=true) {
    for (let row = 0; row < NUM_ROWS; row++) {
        console.log(grid[row].map((b) => (b)?'█':'.').join(''));
    }
    if (waitTime) { let waitTill = new Date(new Date().getTime() + waitTime); while (waitTill > new Date()); }
    if (clear && process.stdout.moveCursor) process.stdout.moveCursor(0, -1*(NUM_ROWS+1));
}

p.onClose = () => {
    console.log('Final:');
    debug(0, false);

    cnt = grid.reduce((total, row) => total+row.reduce((acc, c) => acc+((c)?1:0), 0), 0);
    console.log(`Count: ${cnt}`);
};

p.run();