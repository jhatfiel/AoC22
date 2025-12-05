import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202505 extends AoCPuzzle {
    ranges: {low: number, high: number}[] = [];
    inputs: number[];
    fresh = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let i=0;
        while (lines[i] !== '') {
            const [low, high] = lines[i].split('-').map(Number);
            this.ranges.push({low, high});
            i++;
        }
        this.inputs = lines.slice(i+1).map(Number);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.inputs.length;
        const input = this.inputs[this.stepNumber-1];
        const isFresh = this.ranges.some(({low,high}) => low <= input && input <= high)
        console.log(`input=${input} fresh=${isFresh}`);
        if (isFresh) this.fresh++;
        if (!moreToDo) {
            this.result = this.fresh.toString();
        }
        return moreToDo;
    }
}