import { Puzzle } from '../../lib/puzzle.js';

let patterns = new Array<string>();

for (let i='a'.charCodeAt(0); i<='z'.charCodeAt(0); i++) {
    patterns.push(String.fromCharCode(i) + String.fromCharCode(i).toUpperCase());
    patterns.push(String.fromCharCode(i).toUpperCase() + String.fromCharCode(i));
}

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            console.log(`Start length: ${line.length}`);
            let bestLength = line.length;
            for (let i='a'.charCodeAt(0); i<='z'.charCodeAt(0); i++) {
                let pLine = line.replaceAll(String.fromCharCode(i), '').replaceAll(String.fromCharCode(i).toUpperCase(), '');
                
                while (patterns.some(p => pLine.indexOf(p) !== -1)) patterns.forEach(p => pLine = pLine.replace(p, ''));
                if (pLine.length < bestLength) bestLength = pLine.length;
            }

            console.log(`best length: ${bestLength}`);
        })
    });