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
            // move north (y = y-1)
            gp.matches.sort((a, b) => {
                return a.y - b.y;
            }).forEach(m => {
                while (m.y > 0 && gp.grid[m.y-1][m.x] === '.') {
                    gp.grid[m.y][m.x] = '.'
                    m.y--;
                    gp.grid[m.y][m.x] = 'O'
                }
            });
            // move west (x = x-1)
            gp.matches.sort((a, b) => {
                return a.x - b.x
            }).forEach(m => {
                while (m.x > 0 && gp.grid[m.y][m.x-1] === '.') {
                    gp.grid[m.y][m.x] = '.'
                    m.x--;
                    gp.grid[m.y][m.x] = 'O'
                }
            });
            // move south (y = y+1)
            gp.matches.sort((a, b) => {
                return b.y - a.y
            }).forEach(m => {
                while (m.y < gp.grid.length-1 && gp.grid[m.y+1][m.x] === '.') {
                    gp.grid[m.y][m.x] = '.'
                    m.y++;
                    gp.grid[m.y][m.x] = 'O'
                }
            });
            // move east (x = x+1)
            gp.matches.sort((a, b) => {
                return b.x - a.x;
            }).forEach(m => {
                while (m.x < gp.grid[0].length && gp.grid[m.y][m.x+1] === '.') {
                    gp.grid[m.y][m.x] = '.'
                    m.x++;
                    gp.grid[m.y][m.x] = 'O'
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
    return gp.matches.reduce((acc, m) => acc += gp.grid.length - m.y, 0);
}