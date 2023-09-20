import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let locations = new Set<string>();
    locations.add('0,0');
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
        while (distance--) {
            row += facingMove[facing][0];
            col += facingMove[facing][1];
            let key = `${row},${col}`;
            if (locations.has(key)) console.log(`revisited ${key} ${Math.abs(row)+Math.abs(col)}`);
            locations.add(`${row},${col}`);
        }
        // 269 is too high
    })
};

p.onClose = () => {};

p.run();