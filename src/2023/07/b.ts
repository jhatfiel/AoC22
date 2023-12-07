import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

const CARD_VALUE = new Map<string, number>();
CARD_VALUE.set('J', CARD_VALUE.size+1);
CARD_VALUE.set('2', CARD_VALUE.size+1);
CARD_VALUE.set('3', CARD_VALUE.size+1);
CARD_VALUE.set('4', CARD_VALUE.size+1);
CARD_VALUE.set('5', CARD_VALUE.size+1);
CARD_VALUE.set('6', CARD_VALUE.size+1);
CARD_VALUE.set('7', CARD_VALUE.size+1);
CARD_VALUE.set('8', CARD_VALUE.size+1);
CARD_VALUE.set('9', CARD_VALUE.size+1);
CARD_VALUE.set('T', CARD_VALUE.size+1);
CARD_VALUE.set('Q', CARD_VALUE.size+2);
CARD_VALUE.set('K', CARD_VALUE.size+2);
CARD_VALUE.set('A', CARD_VALUE.size+2);

function getType(cards: string): number {
    return getBestType(cards);
}

function getBestType(cards: string): number {
    let firstJ = cards.indexOf('J');
    if (firstJ !== -1) {
        //console.debug(`finding best type for ${cards}`)
        let cardArr = cards.split('');
        let bestType = -Infinity;
        Array.from(CARD_VALUE.keys()).slice(1).forEach(tryCard => {
            cardArr[firstJ] = tryCard;
            let type = getBestType(cardArr.join(''));
            //console.debug(`   trying ${cardArr.join('')}=${type}`)
            if (type > bestType) bestType = type;
        })
        return bestType;
    } else {
        return _getType(cards);
    }
}

function _getType(cards: string): number {
    let oCnt = puzzle.countOccurrences(cards.split(''));
    let vArr = Array.from(oCnt.values())
    if (oCnt.size === 1) return 6; // 5 of a kind
    if (oCnt.size === 2 && (vArr[0] == 4 || vArr[1] == 4)) return 5; // 4 of a kind
    if (oCnt.size === 2) return 4; // Full House
    if (oCnt.size === 3 && (vArr[0] == 3 || vArr[1] == 3 || vArr[2] == 3)) return 3; // 3 of a kind
    if (oCnt.size === 3) return 2; // Two pair
    if (oCnt.size === 4) return 1; // One pair
    return 0; // High card
}

type Hand = {
    cards: string;
    type: number;
    bid: number;
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let winnings = 0;
        lines.map(line => {
            let [cards, bidStr] = line.split(' ');
            let bid = Number(bidStr);
            let type = getType(cards);
            return {cards, type, bid};
        })
        .sort((handA, handB) => {
            if (handA.type !== handB.type) return handA.type - handB.type;
            for (let i=0; i<5; i++) {
                if (handA.cards[i] !== handB.cards[i]) {
                    return CARD_VALUE.get(handA.cards[i]) - CARD_VALUE.get(handB.cards[i]);
                }
            }
            return 0;
        })
        .forEach((hand, index, arr) => {
            console.debug(`Rank: ${index+1}, Cards: ${hand.cards}, type: ${hand.type}, Bid: ${hand.bid}`)
            winnings += hand.bid * (index+1);
        })
        console.debug(`Total Winnings: ${winnings}`)
    });
