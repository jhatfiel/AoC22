import { CycleDetection, CycleDetectionResult } from "../../lib/cycleDetection.js";
import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const MAX_CYCLES = 1000000000

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let gp = new GridParser(lines, [/O/g]);
        let cycleDetection = new CycleDetection();
        cycleDetection.logValue(generateKey(gp), calculateLoad(gp));
        for (let cycleIndex = 0; cycleIndex < MAX_CYCLES; cycleIndex++) {
            // move north (row = row-1)
            gp.matches.sort((a, b) => {
                return a.row - b.row;
            }).forEach(m => {
                while (m.row > 0 && gp.grid[m.row-1][m.first] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.row--;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move west (col = col-1)
            gp.matches.sort((a, b) => {
                return a.first - b.first
            }).forEach(m => {
                while (m.first > 0 && gp.grid[m.row][m.first-1] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.first--;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move south (row = row+1)
            gp.matches.sort((a, b) => {
                return b.row - a.row
            }).forEach(m => {
                while (m.row < gp.grid.length-1 && gp.grid[m.row+1][m.first] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.row++;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move east (col = col+1)
            gp.matches.sort((a, b) => {
                return b.first - a.first;
            }).forEach(m => {
                while (m.first < gp.grid[0].length && gp.grid[m.row][m.first+1] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.first++;
                    gp.grid[m.row][m.first] = 'O'
                }
            });

            // check for loop
            if (cycleDetection.logValue(generateKey(gp), calculateLoad(gp))) break;
        }

        // calculate load
        console.log(`Total load at ${MAX_CYCLES}: ${cycleDetection.getValueAt(MAX_CYCLES).value}`);
        console.log(`Number of states seen: ${cycleDetection.lastSeenState.size}`)
    });

function generateKey(gp: GridParser): string {
    return gp.grid.flat().join('');
}

function calculateLoad(gp: GridParser): number {
    return gp.matches.reduce((acc, m) => acc += gp.grid.length - m.row, 0);
}