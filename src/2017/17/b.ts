export {};
let input = (process.argv[2] === 'sample')?3:303;

let pos = 0;
let length = 1;

while (length < 50000000) {
    pos = ((pos + input)%length + 1)%length
    if (pos === 0) console.log(`New pos1 = ${length} `);
    length++;
}