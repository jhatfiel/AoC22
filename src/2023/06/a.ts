import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle();
const RACES = (process.argv.length <= 2 || process.argv[2] === 'sample')?[[7, 9], [15, 40], [30, 200]]:[[48,255], [87,1288], [69,1117], [81,1623]];

let tot=1;
RACES.forEach(([length, record]) => {
    let waysToBeat = 0;
    for (let i=0; i<length; i++) {
        let distance = i * (length-i);
        if (distance > record) waysToBeat++;
    }
    console.log(`Length: ${length}; record: ${record}; waysToBeat: ${waysToBeat}`)
    tot *= waysToBeat

})
console.log(`Tot: ${tot}`)