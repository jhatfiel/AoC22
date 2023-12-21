import { Puzzle } from "../../lib/puzzle.js";
import { TurtleLines } from "./turtleLines.js";

const puzzle = new Puzzle(process.argv[2]);

let turtle = new TurtleLines();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let color = arr[2].replace(/[()#]/g, '');
            let dirIndex = Number(color.substring(5));
            let dir = 'RDLU'.substring(dirIndex, dirIndex+1);
            let len = parseInt(color.substring(0, 5), 16);

            turtle.move(dir, len);
        });

        console.log(`Total area: ${turtle.getArea()}`);

        // 122103870175946 is too high
        // 122103870019106 is too high
        // 122103860427465 
    });