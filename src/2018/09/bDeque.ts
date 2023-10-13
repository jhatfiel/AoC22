// 9 players; last marble is worth 25, high score is 32
// 10 players; last marble is worth 1618 points: high score is 8317
// 13 players; last marble is worth 7999 points: high score is 146373
// 17 players; last marble is worth 1104 points: high score is 2764
// 21 players; last marble is worth 6111 points: high score is 54718
// 30 players; last marble is worth 5807 points: high score is 37305
// 465 players; last marble is worth 71498 points

import { Deque } from "../../lib/deque.js";

let configs = [
    {pCnt: 9, mCnt: 26, result: 32},
    {pCnt: 10, mCnt: 1619, result: 8317},
    {pCnt: 13, mCnt: 8000, result: 146373},
    {pCnt: 17, mCnt: 1105, result: 2764},
    {pCnt: 21, mCnt: 6112, result: 54718},
    {pCnt: 30, mCnt: 5808, result: 37305},
    {pCnt: 465, mCnt: 71499, result: 0},
]

for (let config of configs) {
config.mCnt *= 100;
let pScore = new Array<number>(config.pCnt).fill(0);

let pNum = 0;
let deque = new Deque<number>();

for (let m=0; m<config.mCnt; m++) {
    if (m !== 0 && m % 23 === 0) {
        // go back 7 times and remove
        deque.rotate(7);
        pScore[pNum] += m + deque.removeFront();
        deque.rotate(-1);
    } else {
        deque.rotate(-1);
        deque.addFront(m);
    }
    pNum = (pNum+1)%config.pCnt;
}

let maxScore = pScore.reduce((max, s) => Math.max(max, s), 0);
console.log(`Max Score: ${maxScore} (should be ${config.result})`);
}