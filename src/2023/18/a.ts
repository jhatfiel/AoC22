import { Puzzle } from "../../lib/puzzle.js";
import { TurtleLines } from "./turtleLines.js";

const puzzle = new Puzzle(process.argv[2]);

let turtle = new TurtleLines();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let dir = arr[0];
            let len = Number(arr[1]);

            //console.debug(`${dir} ${len} ${color}`)
            turtle.move(dir, len);
        });

        //turtle.debugLines();
        console.log(`Total area: ${turtle.getArea()}`);
    });
