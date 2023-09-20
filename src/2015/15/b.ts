import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class I {
    constructor(public name: string, public capacity: number, public durability: number, public flavor: number, public texture: number, public calories: number) {}
}

let supply = new Array<I>();

p.onLine = (line) => {
    const arr = line.split(/[ :\.,]+/);
    supply.push(new I(arr[0], Number(arr[2]), Number(arr[4]), Number(arr[6]), Number(arr[8]), Number(arr[10])));
};

let desiredCalories = 500;

function iterateSupply(remain: number, iCount: Array<number>) {
    if (iCount.length === supply.length-1) {
        // last one is just whatever remains
        return calculateCookie([...iCount, remain]);
    } else {
        let max = 0;
        for (let i=0; i<=remain; i++) {
            let score = iterateSupply(remain-i, [...iCount, i]);
            if (score > max) max = score;
        }
        return max;
    }
}

function calculateCookie(iCount: Array<number>) {
    let cs = 0;
    let ds = 0;
    let fs = 0;
    let ts = 0;
    let calories = 0;

    iCount.forEach((i, ind) => {
        cs += i*supply[ind].capacity;
        ds += i*supply[ind].durability;
        fs += i*supply[ind].flavor;
        ts += i*supply[ind].texture;
        calories += i*supply[ind].calories;
    })
    cs = Math.max(cs, 0);
    ds = Math.max(ds, 0);
    fs = Math.max(fs, 0);
    ts = Math.max(ts, 0);
    let result = cs*ds*fs*ts;

    if (calories !== desiredCalories) result = 0;

    return result;
}

p.onClose = () => {
    let bestScore = iterateSupply(100, []);

    console.log(`best score = ${bestScore}`);
};

p.run();