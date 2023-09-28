import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let seen = new Map<string, number>();
let cycles = 0;

p.onLine = (line) => {
    let arr = line.split(/\s+/g).map(Number);
    console.log(arr);

    while (undefined === haveSeen(arr, cycles)) {
        console.log(`${cycles}: ${arr.join(',')}`)
        redistributeLargest(arr);
        cycles++;
    }

    console.log(`Cycles: ${cycles}, loop size = ${cycles-haveSeen(arr, cycles)}`);
}

function haveSeen(arr: Array<number>, cycle: number): number|undefined {
    let str = arr.join(',');
    if (seen.has(str)) return seen.get(str)
    else seen.set(str, cycle);

    return undefined;
}

function redistributeLargest(arr: Array<number>) {
    let max = arr.reduce((biggest, n) => biggest = Math.max(n, biggest), -Infinity);
    let index = arr.indexOf(max);
    arr[index] = 0;
    while (max) {
        index = (index+1)%arr.length;
        arr[index]++;
        max--;
    }
}

p.onClose = () => {
}

p.run();