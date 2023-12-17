import { Puzzle } from "../../lib/puzzle.js";
import { GridParser } from '../../lib/gridParser.js';

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let gridParser = new GridParser(lines, [GridParser.NUMBERS, new RegExp(/\*/g)]);
        let total = 0;
        let potGearArr = gridParser.matches.filter(m => m.typeIndex === 1);

        potGearArr.forEach(potGear => {
            let neighbors = gridParser.getMatchNeighbors(potGear, 0).map(gpm => Number(gpm.value));
            if (neighbors.length === 2) {
                console.debug(`Found a gear at ${potGear.y}, ${potGear.x} with neighbors ${neighbors}`)
                total += neighbors[0] * neighbors[1];
            }
        })

        console.log(`Final total is: ${total}`)
    });