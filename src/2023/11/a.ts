import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let unusedRow = new Set<number>();
let unusedCol = new Set<number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let gridParser = new GridParser(lines, [/#/g]);
        for (let row = 0; row<gridParser.grid.length; row++) {
            unusedRow.add(row);
        }
        for (let col = 0; col<gridParser.grid[0].length; col++) {
            unusedCol.add(col);
        }
        gridParser.matches.forEach(m => {
            //console.debug(`Match:`, m)
            unusedRow.delete(m.row);
            unusedCol.delete(m.first);
        })

        gridParser.matches.forEach(m => {
            let expandRows = Array.from(unusedRow.keys()).filter(ur => ur < m.row).length;
            let expandCols = Array.from(unusedCol.keys()).filter(uc => uc < m.first).length;
            m.row += expandRows;
            m.first += expandCols;
            m.last += expandCols;
        });

        /*
        console.debug(`After expansion`)
        gridParser.matches.forEach(m => {
            console.debug(`Match:`, m)
        });
        */

        let totalDistance = 0;
        gridParser.matches.forEach(g1 => {
            gridParser.matches.forEach(g2 => {
                let d = Math.abs(g1.row - g2.row) + Math.abs(g1.first - g2.first);
                //console.debug(`find distance between ${JSON.stringify(g1)} and ${JSON.stringify(g2)} = ${d}`)
                totalDistance += d;
            })
        })
        console.debug(`Total distance = ${totalDistance/2}`)
    });
