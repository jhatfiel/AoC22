import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class c202411 extends AoCPuzzle {
    stones: Map<string, number>;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.stones = new Map<string, number>(lines[0].split(' ').map(n=>([n,1])));
        this.log(`[0] ${[...this.stones.entries()].map(([num,qty])=>`${num}@${qty}`).join('/')}`);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < 75
        let newStones = new Map<string, number>();
        for (let [n,qty] of [...this.stones.entries()]) {
            if (n === '0') {
                newStones.set('1', (newStones.get('1')??0) + qty);
            } else if (n.length % 2 === 0) {
                [n.substring(0, n.length/2), n.substring(n.length/2)].forEach(newNum => newStones.set(newNum, (newStones.get(newNum)??0) + qty));
            } else {
                let newNum = (Number(n)*2024).toString();
                newStones.set(newNum, (newStones.get(newNum)??0) + qty);
            }
        }
        this.stones = newStones;
        let totalStones = [...this.stones.entries()].map(([num,qty])=>qty).reduce((sum,qty)=>sum+qty,0).toString();
        if (!moreToDo) {
            //this.log(`[${this.stepNumber}] totalStones=${totalStones} ${[...this.stones.entries()].map(([num,qty])=>`${num}@${qty}`).join('/')}`);
            this.result = totalStones.toString();
        }
        return moreToDo;
    }
}