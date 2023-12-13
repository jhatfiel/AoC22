import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let pattern = new Array<string>();
        let total = 0;
        lines.forEach(line => {
            if (line) {
                pattern.push(line);
            } else {
                total += processPattern(pattern);
                pattern = new Array<string>();
            }
        });
        total += processPattern(pattern);
        console.debug(`Total: ${total}`);
    });

function processPattern(pattern: Array<string>): number {
    // GridParser is overkill, I thought this would make it easier but it was unnecessary
    let gp = new GridParser(pattern, [/#/g]);
    const DESIRED_NUM_DIFFERENCES = 0; // 1 for part 2...

    // first see if it's a vertical line?
    for (let tryCol = 1; tryCol < gp.grid[0].length; tryCol++) {
        let numDifferences = 0;
        // everything before tryCol must match up with everything after tryCol
        for (let offset=0; offset<Math.min(gp.grid[0].length-tryCol, tryCol); offset++) {
            let colA = tryCol-1-offset;
            let colB = tryCol+offset;
            // ensure all # in colA are in colB
            for (let row=0; row < gp.grid.length; row++) if (gp.grid[row][colA] !== gp.grid[row][colB]) numDifferences++;
        }

        if (numDifferences === DESIRED_NUM_DIFFERENCES) {
            return tryCol;
        }
    }
    
    // check if it's a horizontal line
    for (let tryRow = 1; tryRow < gp.grid.length; tryRow++) {
        let numDifferences = 0;
        // everything before tryRow must match up with everything after tryRow
        for (let offset=0; offset<Math.min(gp.grid.length-tryRow, tryRow); offset++) {
            let rowA = tryRow-1-offset;
            let rowB = tryRow+offset;
            // ensure all # in rowA are in rowB
            for (let col=0; col < gp.grid[0].length; col++) if (gp.grid[rowA][col] !== gp.grid[rowB][col]) numDifferences++;
        }

        if (numDifferences === DESIRED_NUM_DIFFERENCES) {
            return tryRow*100;
        }
    }
}