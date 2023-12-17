import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalLoad = 0;
        let gp = new GridParser(lines, [/O/g, /#/g]);
        gp.matches.filter(m => m.typeIndex === 0).forEach(m => {
            while (m.y > 0 && gp.grid[m.y-1][m.x] === '.') {
                m.y--;
                gp.grid[m.y+1][m.x] = '.'
                gp.grid[m.y][m.x] = 'O'
            }
        });
        gp.debugGrid();
        gp.matches.filter(m => m.typeIndex===0).forEach(m => {
            totalLoad += gp.grid.length - m.y;
        });
        console.log(`Total load: ${totalLoad}`);
    });