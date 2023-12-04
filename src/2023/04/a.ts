import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let total = 0;
        lines.forEach(line => {
            console.debug(line);
            const arr = line.split(':');
            let cardNum = Number(arr[0].split(' ')[1]);
            let [winArr, myArr] = arr[1].split('|').map(s => s.trim().split(' '));
            let cardScore = 0;
            winArr.forEach(wNum => {
                if (myArr.indexOf(wNum) !== -1) {
                    if (cardScore === 0) cardScore = 1;
                    else cardScore *= 2;
                }
            })
            console.debug(`${cardNum}, winners=${winArr}, myCard=${myArr}: score: ${cardScore}`);
            total += cardScore;

        });
        console.log(`Total score: ${total}`)
    });
