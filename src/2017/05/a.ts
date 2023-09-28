import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);
let jumps = new Array<number>();
let currentIndex = 0;

p.onLine = (line) => {
    jumps.push(Number(line));
}

p.onClose = () => {
    let steps = 0;
    while (currentIndex >= 0 && currentIndex < jumps.length) {
        let offset = jumps[currentIndex];
        //console.log(`${steps} ${offset}`);
        jumps[currentIndex] = offset+1;
        currentIndex += offset;
        steps++
    }
    console.log(`Total Steps: ${steps}`)

}

p.run();