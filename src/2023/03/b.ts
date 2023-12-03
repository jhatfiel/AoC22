import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let grid = new Array<Array<string>>();
let potGear = new Map<string, Array<number>>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let total = 0;
        lines.forEach(line => {
            console.debug(line);
            let lineArr = line.split('');
            grid.push(lineArr);
        });

        // find each number, in each line
        for (let rowNum = 0; rowNum < grid.length; rowNum++) {
            //console.debug(`row ${rowNum} is ${grid[rowNum].join('')}`)
            let row = grid[rowNum];
            let numLeft = undefined;
            let numRight = undefined;
            for (let col = 0; col < row.length; col++) {
                let char = row[col];
                if (Number.isInteger(Number(char))) {
                    if (numLeft === undefined) {
                        numLeft = col;
                    }

                    numRight = col;
                    //console.debug(`I might have found the end of a number... from ${numLeft} to ${numRight} which is ${row.slice(numLeft, numRight+1).join('')}`)
                } else {
                    // ok not number, really end of a number, do something
                    if (numLeft !== undefined) {
                        checkForSymbol(rowNum, numLeft, numRight);

                        numLeft = undefined;
                        numRight = undefined;
                    }
                }
            }
            if (numLeft !== undefined) {
                checkForSymbol(rowNum, numLeft, numRight);
            }
        }

        potGear.forEach((numArr, key) => {
            console.debug(`potGear ${key} has numbers: ${numArr}`)
            if (numArr.length === 2) {
                total += numArr[0]*numArr[1];
            }
        })

        console.log(`Final total is: ${total}`)
    });

function addToPotGear(row: number, col: number, num: number) {
    let key = `${row},${col}`
    //console.debug(`PotGear at ${row},${col} found when looking at ${num} (current state of potGear is: ${potGear.get(key)})`);
    let numArr = potGear.get(key);
    if (numArr === undefined) {
        numArr = new Array<number>();
        potGear.set(key, numArr);
    }
    numArr.push(num);
    //console.debug(`After adding this number, potGear is: ${potGear.get(key)}`);
}

function checkForSymbol(rowNum: number, left: number, right: number) {
    let foundSymbol = false;
    let thisNumber = Number(grid[rowNum].slice(left, right+1).join(''));
    if (left !== undefined) {
        if (left > 0 && grid[rowNum][left-1] === '*') addToPotGear(rowNum, left-1, thisNumber)
        if (right < grid[rowNum].length-1 && grid[rowNum][right+1] === '*') addToPotGear(rowNum, right+1, thisNumber)
        if (rowNum > 0) {
            // check rowNum - 1
            for (let i=left-1; i<=right+1; i++) {
                if (i > 0 && i < grid[rowNum-1].length-1 && grid[rowNum-1][i] === '*') addToPotGear(rowNum-1, i, thisNumber)
            }
        }
        if (rowNum < grid.length-1) {
            // check rowNum + 1
            for (let i=left-1; i<=right+1; i++) {
                if (i > 0 && i < grid[rowNum+1].length-1 && grid[rowNum+1][i] === '*') addToPotGear(rowNum+1, i, thisNumber)
            }
        }
    }
    return foundSymbol;
}
