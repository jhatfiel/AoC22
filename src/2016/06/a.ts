import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);
let positionCharacters = Array.from({length: 10}, () => new Array<string>());

p.onLine = (line) => {
    console.log(line);
    line.split('').forEach((c, ind) => {
        positionCharacters[ind].push(c);
    });
};

p.onClose = () => {
    let msg = '';
    positionCharacters.forEach((arr) => {
        let posArr = p.countOccurrences(arr);

        let c = Array.from(posArr.keys()).sort((a, b) => posArr.get(b)! - posArr.get(a)!)[0];
        if (c) msg += c;
    });
    console.log(`The message is ${msg}`);

};

p.run();