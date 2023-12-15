import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let totalHash = 0;
            line.split(',').forEach(piece => {
                let hash = getHash(piece);
                totalHash += hash;
            })
            console.log(`Total Hash: ${totalHash}`)
        });
    });

function getHash(str: string) {
    let result = 0;
    str.split('').forEach(c => {
        let asciiCode = c.charCodeAt(0);
        result += asciiCode;
        result *= 17
        result = result % 256;
    });
    return result;
}