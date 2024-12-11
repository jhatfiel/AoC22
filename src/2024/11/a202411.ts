import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202411 extends AoCPuzzle {
    stones: number[];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.stones = lines[0].split(' ').map(Number);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < 25
        let newStones: number[] = [];
        for (let i=0; i<this.stones.length; i++) {
            let n = this.stones[i];
            if (n === 0) {
                this.stones[i] = 1;
                newStones.push(1);
            } else if (n.toString().length % 2 === 0) {
                let str = n.toString();
                newStones.push(Number(str.substring(0, str.length/2)));
                newStones.push(Number(str.substring(str.length/2)));
            } else {
                newStones.push(n*2024);
            }
        }
        this.stones = newStones;
        this.log(`[${this.stepNumber}] ${this.stones.length}`);
        if (!moreToDo) {
            this.result = this.stones.length.toString();
        }
        return moreToDo;
    }
}