import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let grid = new Array<Array<boolean>>();

p.onLine = (line) => {
    let arr = line.split('').map((c) => c==='#');
    grid.push(arr);
};

function numAround(row: number, col: number): number {
    return p.gridAround(row, col, grid.length-1, grid.length-1).reduce(
        (acc, pair) => acc + (grid[pair.row][pair.col]?1:0), 0)
}

function cycle() {
    let newGrid = Array.from({length:grid.length}, () => new Array<boolean>(grid.length).fill(false));
    grid.forEach((rowArr, row) => {
        rowArr.forEach((state, col) => {
            let onCount = numAround(row, col);
            if (state) newGrid[row][col] = onCount === 2 || onCount === 3;
            else       newGrid[row][col] = onCount === 3;
        })
    })
    grid = newGrid;
}

function onCount() {
    return grid.reduce((s, arr) => s + arr.filter((v) => v).length, 0);
}

function debug() {
    grid.forEach((r) => {
        console.log(r.reduce((acc, c) => acc+((c)?'#':'.'), ''));
    })
}

p.onClose = () => {
    //console.log(`Initial state`);
    //debug();
    //console.log(`Total on: ${onCount()}`);
    for (let cnt = 0; cnt < 100; cnt++) {
        cycle();
        //console.log(`After ${cnt} steps:`);
        //debug();
        console.log(`Total on: ${onCount()}`);
    }
};

p.run();