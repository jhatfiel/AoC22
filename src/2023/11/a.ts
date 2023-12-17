import { GridParser } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let unusedY = new Set<number>();
let unusedX = new Set<number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let gridParser = new GridParser(lines, [/#/g]);
        for (let y = 0; y<gridParser.grid.length; y++) {
            unusedY.add(y);
        }
        for (let col = 0; col<gridParser.grid[0].length; col++) {
            unusedX.add(col);
        }
        gridParser.matches.forEach(m => {
            //console.debug(`Match:`, m)
            unusedY.delete(m.y);
            unusedX.delete(m.x);
        })

        gridParser.matches.forEach(m => {
            let expandRows = Array.from(unusedY.keys()).filter(ur => ur < m.y).length;
            let expandCols = Array.from(unusedX.keys()).filter(uc => uc < m.x).length;
            m.y += expandRows;
            m.x += expandCols;
            m.xEnd += expandCols;
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
                let d = Math.abs(g1.y - g2.y) + Math.abs(g1.x - g2.x);
                //console.debug(`find distance between ${JSON.stringify(g1)} and ${JSON.stringify(g2)} = ${d}`)
                totalDistance += d;
            })
        })
        console.debug(`Total distance = ${totalDistance/2}`)
    });
