import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let row = 2;
let col = 0;

p.onLine = (line) => {
    line.split('').forEach((c) => {
        // if col = 0, row is 2                  2+/-abs(2-col)=0/4 Math.min(0, Math.max(4, row-1))
        // if col = 1, row is between 1 and 3    2+/-abs(2-col)=1/3
        // if col = 2, row is between 0 and 4    2+/-abs(2-col)=2
        // if col = 3, row is between 1 and 3    2+/-abs(2-col)=1/3
        // if col = 4, row is 2                  2+/-abs(2-col)=0/4
        
        switch (c) {
            case 'U': row = Math.max(Math.abs(2-col), row-1); break;
            case 'R': col = Math.min(4-Math.abs(2-row), col+1); break;
            case 'D': row = Math.min(4-Math.abs(2-col), row+1); break;
            case 'L': col = Math.max(Math.abs(2-row), col-1); break;
            default:
                break;
        }
    })

    let key = '';

    if (row === 0) key = '1';
    if (row === 1) key = String.fromCharCode('2'.charCodeAt(0)+col-1);
    if (row === 2) key = String.fromCharCode('5'.charCodeAt(0)+col);
    if (row === 3) key = String.fromCharCode('A'.charCodeAt(0)+col-1);
    if (row === 4) key = 'D';
    console.log(key);
};

p.onClose = () => {};

p.run();