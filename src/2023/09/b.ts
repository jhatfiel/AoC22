import { assert } from "node:console";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let total = 0;
        lines.forEach(line => {
            const lineArray = line.split(' ').map(Number);
            let prevNumber = getPrevNumber(lineArray);
            total += prevNumber;
        });
        console.debug(`Total of all previous numbers: ${total}`);
    });

function getPrevNumber(arr: Array<number>) {
    if (arr.every(n => n === 0)) return 0;
    let diffArray = new Array<number>();

    arr.forEach((n, index) => {
        if (index > 0) diffArray.push(n - arr[index-1])
    })

    let prevDiff = arr[0] - getPrevNumber(diffArray);
    return prevDiff;
}


/*
let testSequence = [0, 0, 0, 0, 0, 0, 0, 0];
assert(0===getNextNumber(testSequence), `Expected 0: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [1, 1, 1, 1, 1, 1, 1, 1];
assert(1===getNextNumber(testSequence), `Expected 1: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
assert(10===getNextNumber(testSequence), `Expected 10: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [0, 2, 4, 6, 8, 10];
assert(12===getNextNumber(testSequence), `Expected 12: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [1, 4, 9, 16, 25, 36];
assert(49===getNextNumber(testSequence), `Expected 49: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [0, 3, 6, 9, 12, 15];
assert(18===getNextNumber(testSequence), `Expected 18: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [1, 3, 6, 10, 15, 21];
assert(28===getNextNumber(testSequence), `Expected 28: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)

testSequence = [10, 13, 16, 21, 30, 45];
assert(68===getNextNumber(testSequence), `Expected 68: sequence ${testSequence}, got ${getNextNumber(testSequence)}`)
*/