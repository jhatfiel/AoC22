import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        console.log(lines.map(Number).reduce((acc, n) => acc+n, 0));
    });
