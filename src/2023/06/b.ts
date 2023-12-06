import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle();
const RACES = (process.argv.length <= 2 || process.argv[2] === 'sample')?[[71530, 940200]]:[[48876981,255128811171623]];

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