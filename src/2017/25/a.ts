export {};
let maxSteps = 6;
let states = new Map<string, Array<any>>();
states.set('a', [[1, 1, 'b'], [0, -1, 'b']]);
states.set('b', [[1, -1, 'a'], [1, 1, 'a']]);
if (process.argv[2] === 'input') {
    maxSteps = 12208951;
    states.set('a', [[1, 1, 'b'], [0, -1, 'e']]);
    states.set('b', [[1, -1, 'c'], [0, 1, 'a']]);
    states.set('c', [[1, -1, 'd'], [0, 1, 'c']]);
    states.set('d', [[1, -1, 'e'], [0, -1, 'f']]);
    states.set('e', [[1, -1, 'a'], [1, -1, 'c']]);
    states.set('f', [[1, -1, 'e'], [1, 1, 'a']]);
}

let state = 'a';
let offset = 10000;
let pos = offset;
let tape = Array.from({length: 2*offset}, () => 0);
let min = offset;
let max = offset;
console.log(`[${(0).toString().padStart(8, ' ')}] ${debugStr(offset-10, offset+10)}`);

for (let step = 0; step < maxSteps; step++) {
    min = Math.min(min, pos);
    max = Math.max(max, pos);
    let n = tape[pos];
    let sArr = states.get(state);
    tape[pos] = sArr[n][0];
    pos += sArr[n][1];
    state = sArr[n][2];
    if (step%10000 === 0 || maxSteps < 10000) console.log(`[${step.toString().padStart(8, ' ')}] ${debugStr(offset-10, offset+10)}`);
}

console.log(`[${(0).toString().padStart(8, ' ')}] ${debugStr(min, max)}`);
console.log(`Checksum: ${tape.slice(min, max+1).reduce((acc, n) => acc+n, 0)}`);

function debugStr(from: number, to: number) {
    let line = '';
    tape.slice(from, to+1).forEach((n, ind) => {
        line += ((from+ind===pos)?'[':((from+ind-1===pos)?']':' ')) + n;
    })
    return line;
}