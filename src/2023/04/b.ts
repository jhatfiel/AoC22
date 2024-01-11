import { Puzzle } from "../../lib/puzzle.js";
import chalk from 'chalk';

const puzzle = new Puzzle(process.argv[2]);
let numCards = new Map<number, number>();
let maxNumCards = 1;
let totCards = 0;

await puzzle.run()
    .then((lines: Array<string>) => {
        for (let cardNum=1; cardNum < lines.length+1; cardNum++) {
            numCards.set(cardNum, 1);
            maxNumCards = cardNum;
        }
        debug(undefined, undefined, undefined, false);
        lines.forEach(line => {
            //console.debug(line);
            const arr = line.split(':');
            let cardNum = Number(arr[0].split(/ +/)[1]);
            let [winArr, myArr] = arr[1].split('|').map(s => s.trim().split(/ +/));
            let numOfThisCard = numCards.get(cardNum);
            totCards += numOfThisCard;
            let matchCount = winArr.filter(wNum => myArr.indexOf(wNum) !== -1).length;
            //console.debug(`${cardNum.toString().padStart(3, ' ')} (${numOfThisCard.toString().padStart(35, ' ')} copies, ${totCards.toString().padStart(35, ' ')} copies so far), matchCount: ${matchCount}`);
            debug(cardNum, numOfThisCard, matchCount);
            for (let i=1; i<matchCount+1; i++) {
                if (cardNum+i <= maxNumCards) numCards.set(cardNum+i, numCards.get(cardNum+i) + numOfThisCard);
            }
            if (matchCount > 0) debug(cardNum, numOfThisCard, matchCount);
        });
        console.log(`Total cards: ${totCards}`, totCards)
        //let waitTill = new Date(new Date().getTime() + 10000); while (waitTill > new Date()); 
    });

function debug(currentCardNum: number, numOfThisCard: number, matchCount: number, scrollback = true) {
    if (scrollback && process.stdout.moveCursor) {
        process.stdout.moveCursor(0, -1*(Math.min(50, maxNumCards) + 3));
        process.stdout.clearLine(0)
    }
    if (currentCardNum) {
        if (matchCount > 0) {
            console.debug(`Card ${chalk.bgRed(currentCardNum)} (${numOfThisCard} copies): ${matchCount} numbers matched so we add ${chalk.underline(numOfThisCard)} to cards ${currentCardNum+1} - ${currentCardNum+matchCount}`)
        } else {
            console.debug(`Card ${chalk.bgRed(currentCardNum)} (${numOfThisCard} copies): has no matches`);
        }
    } else {
        console.debug(`Initial State`)
    }
    for (let row=1; row <= Math.min(50, maxNumCards); row++) {
        // break the cards up into columns with maximum 50 rows
        let line = '';
        for (let colNum = 0; colNum < maxNumCards/50; colNum++) {
            let cardNum = row+50*colNum;
            if (cardNum <= maxNumCards) {
                let displayNumCardsStr = numCards.get(cardNum).toString().padStart(10, ' ');
                if (cardNum > currentCardNum && cardNum <= currentCardNum+matchCount) displayNumCardsStr = chalk.bgRed(displayNumCardsStr)
                if (cardNum === currentCardNum) displayNumCardsStr = chalk.underline(displayNumCardsStr)
                line += displayNumCardsStr + ': ';

                let displayCardNumStr = cardNum.toString().padStart(3, ' ');
                if (cardNum === currentCardNum) displayCardNumStr = chalk.bgRed(displayCardNumStr);
                line += displayCardNumStr
            }
        }
        console.debug(line);
    }
    console.debug(`Total Cards processed: ${totCards}                           (press ENTER to continue)`)
    puzzle.waitForEnter();
}