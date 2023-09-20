import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let row = 0;
    let col = 0;
    let facing = 0;
    let facingMove = [[-1,0], [0,1], [1,0], [0,-1]];
    line.split(/[ ,0]+/).forEach((c) => {
        let turn = c.slice(0, 1);
        let distance = Number(c.slice(1));
        switch (turn) {
            case 'R': facing = (facing+1)%4; break;
            case 'L': facing = (facing+3)%4; break;
        }
        row += facingMove[facing][0]*distance;
        col += facingMove[facing][1]*distance;
    })
    console.log(`row=${row}, col=${col}, distance=${Math.abs(row) + Math.abs(col)}`);
};

p.onClose = () => {};

p.run();