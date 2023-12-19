import { Puzzle } from "../../lib/puzzle.js";
import { TurtleRegion } from "./turtleRegion.js";

const puzzle = new Puzzle(process.argv[2]);

let tr = new TurtleRegion();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let dir = arr[0];
            let len = Number(arr[1]);
            let color = parseInt(arr[2].replace(/[()#]/g, ''), 16);

            console.debug(`${dir} ${len} ${color}`)
            tr.move(dir, len, color);
        });

        tr.normalize();
        tr.fill();
        console.debug(tr.lTurns, tr.rTurns);
        console.debug(Array.from(tr.path.keys()))
        console.debug(Array.from(tr.rSide.keys()))
    });
