import pkg from 'spark-md5';
const { hash } = pkg;

//const SALT='abc'; // 'ahsbgdzn';
const SALT='ahsbgdzn';
const cache = new Map<number, string>();
const OFFSETS_1000 = Array.from({length: 1000}, (_, i) => i+1);
const NEED_COUNT = 64;

let found = 0;
let i = 0;
while (found < NEED_COUNT) {
    const hex = getHex(i);
    // check for 3 characters repeating
    const r = repeating(hex, 3);
    if (r !== undefined) {
        // check for string of 5 of those characters in next 1000 hashes
        //console.log(`[${i.toString().padStart(8, ' ')}] ${hex} has repeating ${r}`);
        if (OFFSETS_1000.some((o) => getHex(i+o).indexOf(r+r+r+r+r) !== -1)) {
            found++;
            console.log(`[${i.toString().padStart(8, ' ')}]/[${found.toString().padStart(2, ' ')}] ${hex} has repeating ${r} AND something after it does too!`);
        }
    }
    i++;
}

function getHex(i: number): string {
    let hex = cache.get(i);
    if (hex === undefined) { hex = hash(SALT+i); cache.set(i, hex); }

    return hex;
}

function repeating(hex: string, len: number): string|undefined {
    let offsets = Array.from({length: len}, (_, i) => i);
    for (let i=0; i<=hex.length-len; i++) {
        let c = hex[i];
        if (offsets.every((o) => c===hex[i+o])) return c;
    }
}