import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202422 extends AoCPuzzle {
    nums: bigint[];
    mod = 16777216n;
    max = 19**4;
    mask = this.mod - 1n;
    sum = 0n;
    bids: number[][] = [];
    diffs: number[][] = [];

    profitAt: number[] = [];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.nums = lines.map(BigInt);
        for (let i=0; i<lines.length; i++) {
            let num = this.nums[i];
            let _num = num;
            let bids = [Number(num%10n)];
            let diffs = [undefined];
            let seen: boolean[] = [];

            for (let i=0; i<2000; i++) {
                let newNum = this.computeSecret(_num);
                let bid = Number(newNum%10n);
                bids.push(bid);
                diffs.push(bids.at(-1) - bids.at(-2));
                _num = newNum;
                if (diffs.length >= 5) {
                    let seqIndex = (diffs.at(-1)+9)*(19**3);
                    seqIndex += (diffs.at(-2)+9)*(19**2);
                    seqIndex += (diffs.at(-3)+9)*(19**1);
                    seqIndex += (diffs.at(-4)+9);
                    if (seen[seqIndex]) continue;
                    seen[seqIndex] = true;
                    this.profitAt[seqIndex] = (this.profitAt[seqIndex]??0) + bid;
                    //if (i < 10) this.log(`i=${i}, seqIndex=${seqIndex}, bid=${bid}`);
                }
            }
            this.bids.push(bids);
            this.diffs.push(diffs);

            //this.log(`${num}, ${_num}, ${bids.slice(0,10)}, ${diffs.slice(0,10)}`);
        }
    }

    computeSecret(n: bigint): bigint {
        n = n ^ (n * 64n) & this.mask; // << 6n
        n = n ^ (n / 32n) & this.mask; // >> 5n
        n = n ^ (n * 2048n) & this.mask; // << 11n

        return n;
    }

    _runStep(): boolean {
        let moreToDo = false;
        //let num = this.nums[this.stepNumber-1];
        //this.log(`${num}: ${num2000}`);

        /*
        let n = this.stepNumber-1;
        let d4 = -1*((n%19)-9);
        n = Math.trunc(n/19);
        let d3 = -1*((n%19)-9);
        n = Math.trunc(n/19);
        let d2 = -1*((n%19)-9);
        n = Math.trunc(n/19);
        let d1 = -1*((n%19)-9);
        
        let profitAt = this.profitAt[this.stepNumber-1];
        if (profitAt && profitAt > this.bestProfit) {
            this.log(`New Best: `, {d4, d3, d2, d1, profitAt}); // starts at 9,9,9,9 and drops the last num first
            this.bestProfit = profitAt;
        }
        */

        if (!moreToDo) {
            this.result = this.profitAt.reduce((max, n)=>Math.max(n,max),0).toString();
        }
        return moreToDo;
    }
}