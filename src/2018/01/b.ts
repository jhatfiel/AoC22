import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let freq = 0;
        let done = false;
        let seen = new Set<number>();
        while (!done) {
            lines.map(Number).some((n) => {
                freq += n;
                //console.log(`n=${n} freq = ${freq}`)
                if (seen.has(freq)) { done = true; }
                seen.add(freq);
                return done;
            })
        }
        console.log(freq);
    });
