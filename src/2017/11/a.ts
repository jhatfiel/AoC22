import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
type Pair = {x: number, y: number};
/*
  o o o
 o o o o
o o o o o
 o o o o
  o o o
*/
let moves = {
    'n':  {x:  0, y: -2},
    'ne': {x: +1, y: -1},
    'se': {x: +1, y: +1},
    's':  {x:  0, y: +2},
    'sw': {x: -1, y: +1},
    'nw': {x: -1, y: -1},
}

let x=0, y=0;

p.onLine = (line) => {
    let arr=line.split(',');
    let furthestAway = -Infinity;
    arr.forEach((m) => {
        x += moves[m].x;
        y += moves[m].y;
        furthestAway = Math.max(furthestAway, pathBack({x,y}).length);
    })
    let path = pathBack({x,y});
    console.log(`Return path steps: ${path.length}`);
    console.log(`Furthest away: ${furthestAway}`);
}

function pathBack(p: Pair): Array<string> {
    let path = new Array<string>();
    while (p.x !== 0 || p.y !== 0) {
        let m='';
        if (p.x < 0) { // need to move e
            m = 'e';
        } else if (p.x > 0) { // need to move w
            m = 'w';
        }

        m = ((p.y<0)?'s':'n') + m;

        p.x += moves[m].x;
        p.y += moves[m].y;
        path.push(m);
    }
    return path;
}

p.onClose = () => { }

p.run();