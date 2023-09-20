import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let matches = line.matchAll(/([a-z-]+)-(\d+)\[([a-z]+)\]/g);
    for (const match of matches) {
        const _name = match[1];
        const name = _name.replace(/-/g, '');
        const sector = Number(match[2]);
        const checksum = match[3];
        let count = p.countOccurrences(name.split(''));
        let computedChecksum = Array.from(count.keys())
            .sort((a, b) => { if (count.get(a) === count.get(b)) return (a<b)?-1:1; else return count.get(b)! - count.get(a)!})
            .reduce((acc, c) => acc+c, '')
            .slice(0, 5);
        if (checksum === computedChecksum) {
            let newName = _name.split('')
                            .reduce((acc, c) => {
                                if (c === '-') return acc + ' ';
                                else return acc + String.fromCharCode('a'.charCodeAt(0) + (c.charCodeAt(0)-'a'.charCodeAt(0) + sector)%26);
                            }, '');
           console.log(`${newName} / ${sector}`); 
        }
    }
};

p.onClose = () => { };

p.run();