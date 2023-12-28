import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line) => {
        })
    });