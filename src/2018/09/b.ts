export {};
// 9 players; last marble is worth 25, high score is 32
// 10 players; last marble is worth 1618 points: high score is 8317
// 13 players; last marble is worth 7999 points: high score is 146373
// 17 players; last marble is worth 1104 points: high score is 2764
// 21 players; last marble is worth 6111 points: high score is 54718
// 30 players; last marble is worth 5807 points: high score is 37305
// 465 players; last marble is worth 71498 points

type DLL = {
    prev?: DLL;
    next?: DLL;
    value: number;
}

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

// player0 and player1 play the first 2 turns, m0 & m1 (2) marbles in, player 2 is up next, size is 2
let pNum = 0;

let HEAD = {value: 0} as DLL;
let pos = HEAD;
pos.next = {prev: pos, next: pos, value: 1};
pos.prev = pos.next;
pos = pos.next;
pNum = 2;

/* However, if the marble that is about to be placed has a number which is a multiple of 23, 
something entirely different happens. First, the current player keeps the marble they would 
have placed, adding it to their score. In addition, the marble 7 marbles counter-clockwise 
from the current marble is removed from the circle and also added to the current player's 
score. The marble located immediately clockwise of the marble that was removed becomes the new current marble. */
for (let m=2; m<config.mCnt; m++) {
    if (m % 23 === 0) {
        pScore[pNum] += m;
        // go back 7 times and remove
        let b = pos.prev.prev.prev.prev.prev.prev;
        let a = b.prev.prev;
        pScore[pNum] += a.next.value;
        a.next = b;
        b.prev = a;
        pos = b;
    } else {
        // insert between a & b
        let a = pos.next;
        let b = a.next;
        a.next = {prev: a, next: b, value: m};
        b.prev = a.next;
        pos = a.next;
    }

    /*
    // debug start
    let line = ''
    let p=HEAD;
    do {
        line += p.value.toString().padStart(3, ' ');
        p = p.next;
    } while (p !== HEAD);
    console.log(`[${pNum.toString().padStart(2, '')}] ${line}`)
    // debug end
    // */

    pNum = (pNum+1)%config.pCnt;
}

let maxScore = pScore.reduce((max, s) => Math.max(max, s), 0);
console.log(`Max Score: ${maxScore} (should be ${config.result})`);
}