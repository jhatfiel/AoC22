import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

const CARD_VALUE = new Map<string, number>();
CARD_VALUE.set('J', 1);
CARD_VALUE.set('2', 2);
CARD_VALUE.set('3', 3);
CARD_VALUE.set('4', 4);
CARD_VALUE.set('5', 5);
CARD_VALUE.set('6', 6);
CARD_VALUE.set('7', 7);
CARD_VALUE.set('8', 8);
CARD_VALUE.set('9', 9);
CARD_VALUE.set('T', 10);
CARD_VALUE.set('Q', 12);
CARD_VALUE.set('K', 13);
CARD_VALUE.set('A', 14);

class Hand {
    constructor(public line: string) {
        let arr = line.split(' ');
        this.cards = arr[0];
        this.bid = Number(arr[1]);
        this.type = this.getType();
        this.score = this.cards.split('').reduce((acc, c, index) => acc += Math.pow(10, 2*(4-index))*CARD_VALUE.get(c), 0);
    }
    public cards: string;
    public type: string;
    public bid: number;
    public score: number;

    private getType(): string {
        return this.getBestType(this.cards);
    }

    private getBestType(cards: string): string {
        let firstJ = cards.indexOf('J');
        if (firstJ !== -1) {
            //console.debug(`finding best type for ${cards}`)
            let cardArr = cards.split('');
            let bestType = '';
            Array.from(CARD_VALUE.keys()).slice(1).forEach(tryCard => {
                cardArr[firstJ] = tryCard;
                let type = this.getBestType(cardArr.join(''));
                //console.debug(`   trying ${cardArr.join('')}=${type}`)
                if (type > bestType) bestType = type;
            })
            return bestType;
        } else {
            return this._getType(cards);
        }
    }

    _getType(cards: string): string {
        let oCnt = puzzle.countOccurrences(cards.split(''));
        let vArr = Array.from(oCnt.values())
        if (oCnt.size === 1) return 'G_5K_'; // 5 of a kind
        if (oCnt.size === 2 && (vArr[0] == 4 || vArr[1] == 4)) return 'F_4K_'; // 4 of a kind
        if (oCnt.size === 2) return 'E_FH_'; // Full House
        if (oCnt.size === 3 && (vArr[0] == 3 || vArr[1] == 3 || vArr[2] == 3)) return 'D_3P_'; // 3 of a kind
        if (oCnt.size === 3) return 'C_2P_'; // Two pair
        if (oCnt.size === 4) return 'B_1P_'; // One pair
        return 'A_HC_'; // High card
    }
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let winnings = 0;
        lines.map(line => new Hand(line))
            .sort((handA, handB) => {
                if (handA.type === handB.type) return handA.score - handB.score;
                else return (handA.type < handB.type)?-1:1;
            })
            .forEach((hand, index) => {
                console.debug(`Rank: ${index+1}, Cards: ${hand.cards}, type: ${hand.type}, score: ${hand.score.toString().padStart(10, '0').match(/.{2}/g)}, Bid: ${hand.bid}`)
                winnings += hand.bid * (index+1);
            })
        console.debug(`Total Winnings: ${winnings}`)
    });
