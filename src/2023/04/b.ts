import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let numCards = new Map<number, bigint>();

await puzzle.run()
    .then((lines: Array<string>) => {
        for (let cardNum=1; cardNum < lines.length+1; cardNum++) {
            numCards.set(cardNum, BigInt(1));
        }
        let totCards = BigInt(0);
        let lastCardNum = lines.length;
        lines.forEach(line => {
            //console.debug(line);
            const arr = line.split(':');
            let cardNum = Number(arr[0].split(/ +/)[1]);
            let [winArr, myArr] = arr[1].split('|').map(s => s.trim().split(' '));
            let matchCount = 0;
            let numOfThisCard = numCards.get(cardNum);
            totCards = totCards + numOfThisCard;
            winArr.forEach(wNum => {
                if (myArr.indexOf(wNum) !== -1) {
                    matchCount++;
                }
            })
            console.debug(`${cardNum.toString().padStart(3, ' ')} (${numOfThisCard.toString().padStart(35, ' ')} copies, ${totCards.toString().padStart(35, ' ')} copies so far), matchCount: ${matchCount}`);
            for (let i=1; i<matchCount+1; i++) {
                if (cardNum+i <= lastCardNum) numCards.set(cardNum+i, numCards.get(cardNum+i) + numOfThisCard);
            }

        });
        console.log(`Total cards: ${totCards}`, totCards)
        // 256489133459779960627280 is wrong??
    });
