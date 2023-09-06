import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let grid: Array<Array<boolean>> = Array.from({length:1000}, () => new Array<boolean>(1000).fill(false));

p.onLine = (line) => {
    console.log(line);
    let arr = line.split(' ');
    let newState: boolean|undefined;

    if (line.startsWith('turn on') || line.startsWith('turn off')) {
        arr.shift();
        newState = (arr[0] === 'on');
    }

    let [top, left] = arr[1].split(',').map(Number);
    let [bottom, right] = arr[3].split(',').map(Number);
    for (let row=top; row<=bottom; row++) {
        for (let col=left; col<=right; col++) {
            if (newState !== undefined) { grid[row][col] = newState; }
            else                        { grid[row][col] = !grid[row][col];  }
        }
    }

};

let debug = () => {
    for (let row=0; row<10; row++) {
        let str = '';
        for (let col=0; col<10; col++) {
            str += (grid[row][col])?'@':'.';
        }
        console.log(str)
    }
}

p.onClose = () => {
    let cnt = grid.reduce((s, arr) => s + arr.filter((v) => v).length, 0);
    console.log(`Total on: ${cnt}`);
};

p.run();