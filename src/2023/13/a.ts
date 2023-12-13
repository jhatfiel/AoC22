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
    console.debug(`Pattern: ${pattern.length}`);
    let gp = new GridParser(pattern, [/#/g]);
    // first see if it's a vertical line?
    let result = 0;
    
    for (let tryCol = 1; tryCol < gp.grid[0].length; tryCol++) {
        //console.debug(`Trying to see reflection is from ${tryCol-1} to ${tryCol}`);
        let validReflection = true;
        // everything before tryCol must match up with everything after tryCol
        for (let offset=0; offset<Math.min(gp.grid[0].length-tryCol, tryCol); offset++) {
            let colA = tryCol-1-offset;
            let colB = tryCol+offset;
            // ensure all # in colA are in colB
            let colAMatches = gp.matches.filter(m => m.first === colA);
            let colBMatches = gp.matches.filter(m => m.first === colB);

            if (colAMatches.length !== colBMatches.length || colAMatches.some((m, ind) => colBMatches[ind].row !== m.row)) {
                validReflection = false
            }
        }

        if (validReflection) {
            console.debug(`Found valid reflection, col=${tryCol}`)
            return tryCol;
        }
    }
    
    for (let tryRow = 1; tryRow < gp.grid.length; tryRow++) {
        //console.debug(`Trying to see reflection is from ${tryRow-1} to ${tryRow}`);
        let validReflection = true;
        // everything before tryRow must match up with everything after tryRow
        for (let offset=0; offset<Math.min(gp.grid.length-tryRow, tryRow); offset++) {
            let rowA = tryRow-1-offset;
            let rowB = tryRow+offset;
            // ensure all # in rowA are in rowB
            let rowAMatches = gp.matches.filter(m => m.row === rowA);
            let rowBMatches = gp.matches.filter(m => m.row === rowB);
            //console.debug(`-------`)
            //console.debug(`Trying out row: ${rowA} and ${rowB}`)

            if (rowAMatches.length !== rowBMatches.length || rowAMatches.some((m, ind) => rowBMatches[ind].first !== m.first)) {
                validReflection = false
                //console.debug(`Failed at row ${rowA} and ${rowB}: ${rowAMatches.length} vs ${rowBMatches.length}`)
            }
        }

        if (validReflection) {
            console.debug(`Found valid reflection, row=${tryRow}`)
            return 100*(tryRow);
        }
    }
}