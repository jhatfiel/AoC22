export {};
let size = 256// 5 // 256
let input = '147,37,249,1,31,2,226,0,161,71,254,243,183,255,30,70'// '3,4,1,5' // '147,37,249,1,31,2,226,0,161,71,254,243,183,255,30,70'
let inputArr = input.split(',').map(Number);

let arr = Array.from({length: size}, (_, ind) => ind);
let curPos = 0;
let skipSize = 0;

function debug() {
    let line=`Next rotation length ${inputArr[0]}: `;
    arr.forEach((c, ind) => {if (ind === curPos) line+='['+c+']'; else line+=c; line+='/'})
    console.log(line);
}

function addMod(p: number, n: number): number {
    return (p+n)%arr.length;
}

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
//debug();

console.log(`Product of first 2 = ${arr[0]*arr[1]}`)