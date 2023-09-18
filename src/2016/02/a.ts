import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let row = 0;
let col = 0;

p.onLine = (line) => {
    line.split('').forEach((c) => {
        switch (c) {
            case 'U': row = Math.max(0, row-1); break;
            case 'R': col = Math.min(2, col+1); break;
            case 'D': row = Math.min(2, row+1); break;
            case 'L': col = Math.max(0, col-1); break;
            default:
                break;
        }
    })

    let key = '1'.charCodeAt(0)+col+row*3;
    console.log(String.fromCharCode(key));
};

p.onClose = () => {};

p.run();