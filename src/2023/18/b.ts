import { Puzzle } from "../../lib/puzzle.js";
import { TurtleRegion } from "./turtleRegion.js";

const puzzle = new Puzzle(process.argv[2]);

let tr = new TurtleRegion();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let color = arr[2].replace(/[()#]/g, '');
            let dirIndex = Number(color.substring(5));
            let dir = 'RDLU'.substring(dirIndex, dirIndex+1);
            let len = parseInt(color.substring(0, 5), 16);

            console.debug(`${color} ${dir} ${len}`)
            tr.move(dir, len, 1);
        });

        tr.normalize();
        let result = tr.fill();
        //console.debug(Array.from(tr.path.keys()))
        //console.debug(Array.from(result.keys()))

        console.log(`Total size of lagoon = ${tr.path.size + result.size}`)
    });
