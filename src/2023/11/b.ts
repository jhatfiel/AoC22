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
            unusedRow.delete(m.y);
            unusedCol.delete(m.x);
        })

        let expansionSize = 999999;
        gridParser.matches.forEach(m => {
            let expandRows = Array.from(unusedRow.keys()).filter(ur => ur < m.y).length;
            let expandCols = Array.from(unusedCol.keys()).filter(uc => uc < m.x).length;
            m.y += expandRows*expansionSize;
            m.x += expandCols*expansionSize;
            m.xEnd += expandCols*expansionSize;
        });

        let totalDistance = 0;
        gridParser.matches.forEach(g1 => {
            gridParser.matches.forEach(g2 => {
                let d = Math.abs(g1.y - g2.y) + Math.abs(g1.x - g2.x);
                totalDistance += d;
            })
        })
        console.debug(`Total distance = ${totalDistance/2}`);
    });
