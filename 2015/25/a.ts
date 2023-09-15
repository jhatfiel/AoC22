let qRow = 3010;
let qCol = 3019;

let codeArr = new Array<Array<number>>();
let lastSeen = new Map<number, number>(); // looks like the numbers repeat after 16777196 numbers... will that help any?

function rcToOffset(row: number, col: number): number { // should we convert to offsets (somehow?) so we can use the cyclic repition?
    return 0;
}

/*
let ind = 1;
let num = 20151125;
while (true) {
    if (!lastSeen.has(num)) lastSeen.set(num, ind);
    else {
        console.log(`REPEATED: ${num} offset=${ind-lastSeen.get(num)!}`)
    }

    ind++;
    num = (num * 252533) % 33554393;
}
*/

let row = 1;
let col = 1;
let num = 20151125;
while (row !== qRow || col !== qCol) {
    if (row === 1) { row = col+1; col = 1; }
    else { row--; col++; }
    num = (num * 252533) % 33554393;
    //console.log(`${row}/${col} = ${num}`);
}

console.log(`${row}/${col} = ${num}`);

// oh, I get it.  the 25th puzzle is SUPER easy so that you can get back to presents.  Merry Christmas!