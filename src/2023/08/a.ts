import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        const TURNS = lines[0].split('').map(t => t==='L'?0:1);
        const NEXT = new Map<string, Array<string>>();
        lines.slice(2).forEach(line => {
            let [from, directions] = line.split(' = ');
            NEXT.set(from, directions.replace(/[()]/g, '').split(', '));
        });
        
        let steps = 0;
        let curNode = 'AAA';
        while (curNode !== 'ZZZ') {
            curNode = NEXT.get(curNode)[TURNS[steps%TURNS.length]];
            steps++;
            console.debug(`[${steps}]: Moving to ${curNode}`)
        };
    });
