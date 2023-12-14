import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
var lastSeenState = new Map<string, number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalLoad = 0;
        let gp = new GridParser(lines, [/O/g, /#/g]);
        const MAX_CYCLES = 1000000000
        for (let cycle = 0; cycle < MAX_CYCLES; cycle++) {
            if (cycle % 1000 === 0) { console.debug(`Cycle: ${cycle}`)}
            // move north (row = row-1)
            gp.matches.filter(m => m.typeIndex === 0).sort((a, b) => {
                return a.row - b.row;
            }).forEach(m => {
                while (m.row > 0 && gp.grid[m.row-1][m.first] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.row--;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move west (col = col-1)
            gp.matches.filter(m => m.typeIndex === 0).sort((a, b) => {
                return a.first - b.first
            }).forEach(m => {
                while (m.first > 0 && gp.grid[m.row][m.first-1] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.first--;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move south (row = row+1)
            gp.matches.filter(m => m.typeIndex === 0).sort((a, b) => {
                return b.row - a.row
            }).forEach(m => {
                while (m.row < gp.grid.length-1 && gp.grid[m.row+1][m.first] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.row++;
                    gp.grid[m.row][m.first] = 'O'
                }
            });
            // move east (col = col+1)
            gp.matches.filter(m => m.typeIndex === 0).sort((a, b) => {
                return b.first - a.first;
            }).forEach(m => {
                while (m.first < gp.grid[0].length && gp.grid[m.row][m.first+1] === '.') {
                    gp.grid[m.row][m.first] = '.'
                    m.first++;
                    gp.grid[m.row][m.first] = 'O'
                }
            });

            // loop?
            let key = gp.grid.flat().join('');
            if (lastSeenState.has(key)) {
                let loopSize = cycle - lastSeenState.get(key);
                let remaining = MAX_CYCLES - cycle;
                let numLoops = Math.floor(remaining/loopSize); 
                console.debug(`Cycle: ${cycle} - Found loop: ${loopSize}, jumping forward to ${cycle+numLoops*loopSize}`)
                cycle += numLoops * loopSize;
            } else {
                lastSeenState.set(key, cycle);
            }
        }
        console.debug(`Final`)
        debugGrid(gp.grid);

        // calculate load
        gp.matches.filter(m => m.typeIndex===0).forEach(m => {
            totalLoad += gp.grid.length - m.row;
        });
        console.log(`Total load: ${totalLoad}`);
    });

function debugGrid(grid: Array<Array<string>>) {
    grid.forEach(row => {
        console.debug(row.join(''))
    })

}