import { Pair } from "../../lib/grid.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
const directions = [{x:0,y:1},{x:-1,y:0},{x:0,y:-1},{x:1,y:0}];
const DD = 0;
const DL = 1;
const DU = 2;
const DR = 3;

let grid = new Array<Array<string>>();
let maxX=0, maxY=0;

puzzle.onLine = (line) => {
    grid.push(line.split(''));
}

puzzle.onClose = () => {
    let p: Pair = {x: grid[0].indexOf('|'), y: 0};
    let nextDir = DD;
    maxY = grid.length;
    maxX = grid[0].length;
    let letters = '';
    let stepCount = 0;

    while (nextDir !== -1) {
        stepCount++;
        // move to the nextDir
        p.x += directions[nextDir].x;
        p.y += directions[nextDir].y;

        let c = grid[p.y][p.x];
        // if we are at a letter, emit it
        if (c >= 'A' && c <= 'Z') { console.log(`Saw letter: ${c}`); letters += c; }

        // find out if we can continue or if we need to turn, or if we're done
        nextDir = getNextDir(p, nextDir);
    }

    console.log(`Final letter sequence: ${letters}`);
    console.log(`Final step count: ${stepCount}`);
}

function getNextDir(curPos: Pair, direction: number) {
    //console.log(`nextDir(${JSON.stringify(curPos)}, ${direction}) called`);
    let nextDir = -1;
    let c = grid[curPos.y][curPos.x];
    if (c === '+') {
        // we need to turn
        let dCW = (direction+1)%4;
        let dCCW = (direction+3)%4;
        let vCW = true;
        let vCCW = true;
        // if we try one of the directions and hit a space, it's not a valid direction.
        // If we hit a '+', it's valid, we could have gone under a bunch of invalid characters and then hit a branch point
        // if we hit a letter, it could be valid
        // if we hit the direction we're looking to see, it's immediately valid
        let goal = '+' + ((direction%2 === 0)?'-':'|');// 'ABCDEFGHIJKLMNOPQRSTUVWXYZ+' + (direction%2 === 0)?'-':'|';
        let i=0; 
        //console.log(`looking for ${goal}`);

        while ((vCW || vCCW) && nextDir === -1) {
            i++;
            let cwP = {x: curPos.x + i*directions[dCW].x, y: curPos.y + i*directions[dCW].y};
            let ccwP = {x: curPos.x + i*directions[dCCW].x, y: curPos.y + i*directions[dCCW].y};
            let cwChar = (vCW && cwP.y >= 0 && cwP.y < maxY && cwP.x >= 0 && cwP.x < maxX)?grid[cwP.y][cwP.x]:' ';
            let ccwChar = (vCCW && ccwP.y >= 0 && ccwP.y < maxY && ccwP.x >= 0 && ccwP.x < maxX)?grid[ccwP.y][ccwP.x]:' ';
            //console.log(`Need to turn, looking at ${cwChar} and ${ccwChar}`)
            if (cwChar === ' ') { vCW = false; }
            if (goal.indexOf(cwChar) !== -1) {
                //console.log(`Found next valid character at ${i} steps away in cw direction ${dCW}`);
                nextDir = dCW;
            }
            if (ccwChar === ' ') { vCCW = false; }
            if (goal.indexOf(ccwChar) !== -1) {
                //console.log(`Found next valid character at ${i} steps away in ccw direction ${dCCW}`);
                nextDir = dCCW;
            }
        }
    } else if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ|-'.indexOf(c) !== -1) nextDir = direction;
    //console.log(`nextDir(${JSON.stringify(curPos)})/${c} returning ${nextDir}`)
    return nextDir;
}

puzzle.run();