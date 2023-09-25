// root@ebhq-gridcenter# df -h
// Filesystem              Size  Used  Avail  Use%
// /dev/grid/node-x0-y0     85T   72T    13T   84%

import { formatWithOptions } from "node:util";
import { Puzzle } from "../../lib/puzzle.js";
import { moveMessagePortToContext } from "node:worker_threads";
type Pair = {x:number, y:number};
type Node = {location: Pair, size: number};
type Move = {from: Pair, to: Pair};

let size = new Array<Array<number>>();
let used = new Array<Array<number>>();
let maxX = -1;
let maxY = 0;
// [x][y]

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let arr = line.split(/ +/);
    //console.log(arr);
    let fnArr = arr[0].split('-');
    let x = Number(fnArr[1].slice(1));
    let y = Number(fnArr[2].slice(1));
    if (y===0) {
        size.push(new Array<number>());
        used.push(new Array<number>());
        maxX++;
    }
    size[maxX].push(Number(arr[1].replace('T', '')));
    used[maxX].push(Number(arr[2].replace('T', '')));
};

// we are trying to access data in x=max, y=0

// we are going to have to record state:
// the entire grid??
// - well, the nodes don't move around, so theoretically we only need to record the used at each location?
// where the desired data currently is (it starts at x=max, y=0)
// we never want to revisit identical state
// - however, goal data could move away from 0,0
// - additionally, the "empty spot" could move away from the goal data and 0,0 
// - goal data should NEVER end up back where it has been? (maybe?)
// - if we move the goal data to a new location, anybody else who is trying to move to there should terminate

/// uh, or just look at the resulting situation.
// once the hole is to the right of the goal data, 5 moves to take it one step to the left
// 45 to get the hole to the top corner
// 30 moves along the top row once the hole is in the top right corner
// so 45 + 5*30 = 195?
// bummer, 75 is incorrect

p.onClose = () => {
    let moves = new Array<Move>();
    moves.push({from: {x:24,y:25}, to: {x:24,y:26}});
    moves.push({from: {x:24,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:23,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:22,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:21,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:20,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:19,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:24}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:23}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:22}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:21}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:20}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:19}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:18}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:17}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:16}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:15}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:14}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:13}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:12}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:11}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:10}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:9}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:8}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:7}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:6}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:5}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:4}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:3}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:2}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:1}, to: moves[moves.length-1].from});
    moves.push({from: {x:18,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:19,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:20,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:21,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:22,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:23,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:24,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:25,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:26,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:27,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:28,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:29,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:30,y:0}, to: moves[moves.length-1].from});
    moves.push({from: {x:31,y:0}, to: moves[moves.length-1].from});
    for (let x=31; x>1; x--) {
        moves.push({from: {x:x,y:0}, to: moves[moves.length-1].from});
        moves.push({from: {x:x,y:1}, to: moves[moves.length-1].from});
        moves.push({from: {x:x-1,y:1}, to: moves[moves.length-1].from});
        moves.push({from: {x:x-2,y:1}, to: moves[moves.length-1].from});
        moves.push({from: {x:x-2,y:0}, to: moves[moves.length-1].from});
        moves.push({from: {x:x-1,y:0}, to: moves[moves.length-1].from});
    }
    moves.forEach((m) => {
        console.log(JSON.stringify(m));
        debugGrid(true, 50);
        executeMove(m);
    })
    console.log('                                                                            ');
    debugGrid(false, 0);
    console.log(`Total Moves: ${moves.length}`);
};

p.run();

function debugGrid(clear=true, waitTime=0) {
    for (let y=0; y<used[0].length; y++) {
        let line = '';
        for (let x=0; x<used.length; x++) {
            if (used[x][y] === 0) line += '___/' + size[x][y].toString().padEnd(3, ' ');
            else line += used[x][y].toString().padStart(3,' ') + '/' + size[x][y].toString().padEnd(3, ' ')
        }
        console.log(line);
    }
    if (waitTime) { let waitTill = new Date(new Date().getTime() + waitTime); while (waitTill > new Date()); }
    if (clear && process.stdout.moveCursor) process.stdout.moveCursor(0, -1*(used[0].length+1));
}

function executeMove(move: Move) {
    let temp = used[move.from.x][move.from.y];
    if (temp < size[move.to.x][move.to.y] - used[move.to.x][move.to.y]) {
        used[move.from.x][move.from.y] = used[move.to.x][move.to.y];
        used[move.to.x][move.to.y] = temp;
    } else {
        throw new Error(`Cannot execute move: ${JSON.stringify(move)}`);
    }
}

function getPotentialMoves() {
    maxY = size[maxX].length-1;
    let potentialMoves = new Array<Move>();
    size.forEach((row, x) => {
        row.forEach((s, y) => {
            p.gridOrthogonalP({x,y}, {x:maxX, y:maxY}).forEach((a) => {
                if (used[x][y] > 0 && used[x][y] <= s-used[a.x][a.y]) {
                    console.log(`Could move from ${JSON.stringify({x,y})} ${used[x][y]} -> ${JSON.stringify(a)} [${used[a.x][a.y]}/${s}]`);
                    potentialMoves.push({from: {x,y}, to: a});
                }
            })
        });
    })

    console.log(`Potential Moves: ${potentialMoves.length}`);
}