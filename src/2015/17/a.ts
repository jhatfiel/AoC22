import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let containers = new Array<number>();

p.onLine = (line) => {
    containers.push(Number(line));
};

function getSpace(mask: number): number {
    let result = 0;
    for (let i=0; i<containers.length; i++) {
        if (mask & (1<<i)) result += containers[i];
    }
    return result;
}

p.onClose = () => {
    const space = 150;
    let matchCount = 0;
    for (let i=1; i< (1<<containers.length); i++) {
        if (getSpace(i) === space) { matchCount++; console.log(`${i.toString(2).padStart(containers.length, '0')}`);}
    }
    console.log(`Match count: ${matchCount}`);
};

p.run();