import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let grid = new Array<Array<string>>();

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
                        if (checkForSymbol(rowNum, numLeft, numRight)) {
                            total += Number(row.slice(numLeft, numRight+1).join(''));
                        }

                        numLeft = undefined;
                        numRight = undefined;
                    }
                }
            }
            if (numLeft !== undefined) {
                if (checkForSymbol(rowNum, numLeft, numRight)) {
                    total += Number(row.slice(numLeft, numRight+1).join(''));
                }
            }

        }

        console.log(`Final total is: ${total}`)
    });

function checkForSymbol(rowNum: number, left: number, right: number) {
    let foundSymbol = false;
    if (left !== undefined) {
        //console.debug(`rowNum=${rowNum}, ${left} to ${right} is ${grid[rowNum].slice(left, right+1).join('')}`)
        if (left > 0 && grid[rowNum][left-1] !== '.') foundSymbol = true;
        if (right < grid[rowNum].length-1 && grid[rowNum][right+1] !== '.') foundSymbol = true;
        if (rowNum > 0) {
            // check rowNum - 1
            for (let i=left-1; i<=right+1; i++) {
                if (i > 0 && i < grid[rowNum-1].length-1 && grid[rowNum-1][i] !== '.') foundSymbol = true;
            }
        }
        if (rowNum < grid.length-1) {
            // check rowNum + 1
            for (let i=left-1; i<=right+1; i++) {
                if (i > 0 && i < grid[rowNum+1].length-1 && grid[rowNum+1][i] !== '.') foundSymbol = true;
            }
        }
    }
    return foundSymbol;
}
