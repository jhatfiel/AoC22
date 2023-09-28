let size = 256
//let size = 5;

let input = '147,37,249,1,31,2,226,0,161,71,254,243,183,255,30,70'
//let input = ''
//let input = '1,2,3'
//let input = '1,2,4'
//let input = 'AoC 2017'

let maxRound = 64;
let arr = Array.from({length: size}, (_, ind) => ind);
let originalInputArr = input.split('').map((c) => c.charCodeAt(0));
originalInputArr.push(17, 31, 73, 47, 23);
console.log(`originalInputArr: ${originalInputArr}`);

function debug() {
    let line=`Current Position (${curPos}) skip size (${skipSize}): `;
    arr.forEach((c, ind) => {if (ind === curPos) line+='['+c+']'; else line+=c; line+='/'})
    console.log(line);
}

function addMod(p: number, n: number): number {
    return (p+n)%arr.length;
}

let inputArr: Array<number>;
let curPos = 0;
let skipSize = 0;
for (let round=0; round<maxRound; round++) {
    inputArr = [...originalInputArr];
    while (inputArr.length) {
        //debug();
        let len = inputArr.shift();
        for (let i=0; i < len/2; i++) {
            let t=arr[addMod(curPos, i)];
            arr[addMod(curPos, i)] = arr[addMod(curPos, len-1-i)];
            arr[addMod(curPos, len-1-i)] = t;
        }
        curPos = addMod(curPos, len+skipSize);
        skipSize++;
    }
}
debug();

let dense = new Array<string>();
for (let i=0; i<16; i++) {
    dense.push(arr.slice(16*i, 16*i+16).reduce((acc, n) => acc = acc ^ n, 0).toString(16).padStart(2, '0'));
}

console.log(dense.join(''));