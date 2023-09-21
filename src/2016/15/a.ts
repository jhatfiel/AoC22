type Disc = { pCnt: number, p: number };

let discs = new Array<Disc>();

/*
// Sample
discs.push({pCnt: 5, p: 4});
discs.push({pCnt: 2, p: 1});
/*/
discs.push({pCnt: 17, p: 5});
discs.push({pCnt: 19, p: 8});
discs.push({pCnt: 7, p: 1});
discs.push({pCnt: 13, p: 7});
discs.push({pCnt: 5, p: 1});
discs.push({pCnt: 3, p: 0});
//*/

for (let time=0; time<Infinity; time++) {
    //console.log(`Time: ${time}`);
    //if (process.stdout.moveCursor) process.stdout.moveCursor(0, -1);
    //discs.forEach((d, ind) => console.log(`-- [${ind}]: ${d.p}/${d.pCnt}`));

    if (discs.every((d, ind) => posAfterTime(d, ind) === 0)) {
        console.log(`Wait until second: ${time-1}`);
        break;
    }

    discs.forEach((d, ind) => d.p = posAfterTime(d, 1));
}

function posAfterTime(d: Disc, t: number): number {
    return (d.p+t)%d.pCnt;
}