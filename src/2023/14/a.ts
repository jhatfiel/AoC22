import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalLoad = 0;
        let gp = new GridParser(lines, [/O/g, /#/g]);
        gp.matches.filter(m => m.typeIndex === 0).forEach(m => {
            while (m.row > 0 && gp.grid[m.row-1][m.first] === '.') {
                m.row--;
                gp.grid[m.row+1][m.first] = '.'
                gp.grid[m.row][m.first] = 'O'
            }
        });
        debugGrid(gp.grid);
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