import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202411 extends AoCPuzzle {
    stones: number[];
    cache: number[][] = [];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.stones = lines[0].split(' ').map(Number);
    }

    numTermsAfter(n, i): number {
        let result = 0;
        let arr = this.cache[n];
        if (arr === undefined) {
            arr = [];
            this.cache[n] = arr;
        } else if (arr[i] !== undefined) {
            //this.log(`Cache HIT: ${n},${i}=${arr[i]}`);
            return arr[i];
        }
        let str = n.toString();
        if (i === 0) result = 1
        else if (n === 0) result = this.numTermsAfter(1, i-1);
        else if (str.length % 2 === 0) result = this.numTermsAfter(Number(str.substring(0, str.length/2)), i-1) + this.numTermsAfter(Number(str.substring(str.length/2)), i-1);
        else result = this.numTermsAfter(n*2024, i-1);
        arr[i] = result;
        //this.log(`Cache MISS: ${n},${i}=${result}`);
        return result;
    }

    _runStep(): boolean {
        let moreToDo = false;
        let result = this.stones.map(n => this.numTermsAfter(n, 75)).reduce((sum, n)=>sum+n,0);
        this.log(`Part 2: ${result}`);
        result = this.stones.map(n => this.numTermsAfter(n, 25)).reduce((sum, n)=>sum+n,0);
        this.log(`Part 1: ${result}`);
        if (!moreToDo) {
            this.result = result.toString();
        }
        return moreToDo;
    }
}