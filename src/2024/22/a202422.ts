import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202422 extends AoCPuzzle {
    nums: bigint[];
    mod = 16777216n;
    mask = this.mod - 1n;
    sum = 0n;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.nums = lines.map(BigInt);
    }

    computeSecret(n: bigint): bigint {
        n = n ^ (n * 64n) & this.mask; // << 6n
        n = n ^ (n / 32n) & this.mask; // >> 5n
        n = n ^ (n * 2048n) & this.mask; // << 11n

        return n;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.nums.length;
        let num = this.nums[this.stepNumber-1];
        let num2000 = num;

        for (let i=0; i<2000; i++) {
            num2000 = this.computeSecret(num2000);
        }

        //this.log(`${num}: ${num2000}`);
        this.sum += num2000;

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}