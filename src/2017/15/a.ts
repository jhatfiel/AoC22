export {};
let aStart = 722, bStart = 354; // input
if (process.argv[2] === 'sample') { aStart = 65, bStart = 8921; }

let a = aStart, b = bStart;

let cycle = 0;
let same = 0;
while (cycle <= 40000000) {
    a *= 16807; a %= 2147483647;
    b *= 48271; b %= 2147483647;
    if (cycle%1000000===0) { console.log(`[${cycle}] ${a.toString().padStart(15, ' ')} ${b.toString().padStart(15, ' ')}`)}
    if ((a&0xFFFF)===(b&0xFFFF)) {
        same++;
    }
    cycle++;
}
console.log(`Same: ${same}`)