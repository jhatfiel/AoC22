import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let sectorSum = 0;

p.onLine = (line) => {
    console.log(line);
    let matches = line.matchAll(/([a-z\-]+)-(\d+)\[([a-z]+)\]/g);
    for (const match of matches) {
        const name = match[1].replace(/-/g, '');
        const sector = Number(match[2]);
        const checksum = match[3];
        let count = p.countOccurrences(name.split(''));
        let computedChecksum = Array.from(count.keys())
            .sort((a, b) => { if (count.get(a) === count.get(b)) return (a<b)?-1:1; else return count.get(b)! - count.get(a)!})
            .reduce((acc, c) => acc+c, '')
            .slice(0, 5);
        console.log(`${name} / ${sector} / ${checksum} / ${computedChecksum}`);
        if (checksum === computedChecksum) sectorSum += sector;
        
    }

};

p.onClose = () => {
    console.log(`Total possible: ${sectorSum}`);
};

p.run();