import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202505 extends AoCPuzzle {
    inputs: {low: number, high: number}[];
    lastLow = -1;
    lastHigh = -1;
    count = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.inputs = lines
            .filter(l => l.indexOf('-') !== -1)
            .map(l => l.split('-').map(Number))
            .map(([low, high]) => ({low, high}))
            .sort((a, b) => {
                return a.low - b.low;
            });
    }

    _runStep(): boolean {
        if (this.stepNumber > this.inputs.length) {
            if (this.lastLow !== -1) {
                this.count += this.lastHigh - this.lastLow + 1;
            }
            this.result = this.count.toString();;
            return false;
        }

        const {low, high} = this.inputs[this.stepNumber-1];
        console.log(`low=${low}, high=${high}`)

        if (this.lastLow === -1) {
            this.lastLow = low;
            this.lastHigh = high;
        } else {
            // do bounds checking
            if (low <= this.lastHigh+1) {
                // join
                console.log(`joining ${low}-${high} to ${this.lastLow}-${this.lastHigh}`)
                this.lastHigh = Math.max(this.lastHigh, high);
            } else {
                // record this.lastHigh-this.lastLow + 1
                this.count += this.lastHigh - this.lastLow + 1;
                // reset last's
                this.lastLow = low;
                this.lastHigh = high;
            }
        }

        return true;
    }
}