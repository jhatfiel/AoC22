import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

type Point = {
    pos: Pair;
    velo: Pair;
}

let pArr = new Array<Point>();
let sec = 0;

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line) => {
            let [x, y, vx, vy] = line.match(/<([\d- ]+),([\d- ]+)>[^<]+<([\d- ]+),([\d- ]+)>/).slice(1).map(Number);
            pArr.push({pos: {x,y}, velo: {x:vx, y: vy}});
        })

        let bounds = getBounds();
        while (bounds.BR.y - bounds.TL.y > 20) {
            console.log(`[${sec.toString().padStart(5, ' ')}] ${JSON.stringify(bounds)}`);
            move();
            bounds = getBounds();
            sec++;
        }

        // print out message
        for (let i=0; i<20; i++) {
            print();
            move();
            sec++;
        }

    });

function getBounds() {
    let TL={x: Infinity, y: Infinity};
    let BR={x: -Infinity, y: -Infinity};
    pArr.forEach(p => { TL.y = Math.min(TL.y, p.pos.y); BR.y = Math.max(BR.y, p.pos.y); TL.x = Math.min(TL.x, p.pos.x); BR.x = Math.max(BR.x, p.pos.x); });
    return {TL, BR}

}

function move() {
    pArr.forEach(p => { p.pos.x += p.velo.x; p.pos.y += p.velo.y; });
}

function print() {
    let bounds = getBounds();
    console.log(`[${sec.toString().padStart(5, ' ')}] ${JSON.stringify(bounds)}`);
    for (let y=bounds.TL.y; y<=bounds.BR.y; y++) {
        let line = '';
        for (let x=bounds.TL.x; x<=bounds.BR.x; x++) {
            line += (pArr.some(p => {return p.pos.x === x && p.pos.y === y}))?'#':'.';
        }
        console.log(line);
    }
}