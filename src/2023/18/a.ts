import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let dir = arr[0];
            let len = arr[1];
            let color = arr[2].replace(/[()]/g, '');

            console.debug(`${dir} ${len} ${color}`)
        });
    });
