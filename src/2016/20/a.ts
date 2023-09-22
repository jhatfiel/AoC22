import { Puzzle } from "../../lib/puzzle.js";

const MAX=4294967295; // 10; // 4294967295
type Range = { from: number, to: number };

let p = new Puzzle(process.argv[2]);
let allowed: Array<Range> = [{from: 0, to: MAX}];

p.onLine = (line) => {
    //debugState();
    debug(`Blacklist: ${line}`);
    let [from, to] = line.split('-').map(Number);
    let arr = new Array<Range>(allowed.length);

    allowed.forEach((r) => {
        //  <--- r --->
        // <----------->  - blacklist covers existing valid range, remove it
             if (from <= r.from && to >= r.to) debug(`Get rid of ${JSON.stringify(r)}`);
        //  <--- r --->
        // <-------->  - blacklist covers some valid range, adjust the r.from to be to+1
        else if (from <= r.from && to >= r.from && to < r.to) { debug(`Adjusting ${JSON.stringify(r)}, from=${to+1}`); r.from = to+1; arr.push(r); }
        //  <--- r --->
        //     <-------->  - same as above (kinda), adjust the r.to to be from-1
        else if (from > r.from && from <= r.to && to >= r.to) { debug(`Adjusting ${JSON.stringify(r)}, to=${from-1}`); r.to = from-1; arr.push(r); }
        //  <--- r --->
        //     <--->  - blacklist chops a valid range in two, make 2 ranges
        else if (from > r.from && to < r.to) { debug(`Splitting ${JSON.stringify(r)}`); arr.push({from: r.from, to: from-1}); arr.push({from: to+1, to: r.to}); }
        else { debug(`No effect`); arr.push(r); }
    })
    allowed = arr;
}

function debug(line='') {
    //console.log(line);
}

function debugState() {
    console.log(`Current allowed ranges:`);
    allowed.forEach((r) => console.log(JSON.stringify(r)));
}

p.onClose = () => {
    //debugState();
    let lowestFrom = allowed.reduce((acc, r) => acc = Math.min(acc, r.from), Infinity);
    let allowedCount = allowed.reduce((acc, r) => acc += r.to-r.from+1, 0);
    allowed.forEach((r) => console.log(`${toIp(r.from)} - ${toIp(r.to)}`));
    console.log(`Lowest From: ${lowestFrom}, number allowed: ${allowedCount}`);
}

p.run();

function toIp(n: number) {
    let str = (n&0xFF).toString();
    n>>=16;
    str = (n&0xFF).toString() + '.' + str;
    n>>=16;
    str = (n&0xFF).toString() + '.' + str;
    n>>=16;
    str = (n&0xFF).toString() + '.' + str;
    return str;
}