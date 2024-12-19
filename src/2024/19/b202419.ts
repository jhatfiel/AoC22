import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202419 extends AoCPuzzle {
    types: string[];
    count = 0;
    cache = new Map<string, number>();
    maxWays: number = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.types = lines[0].split(', ');
    }

    countCompose(pattern: string): number {
        if (!pattern) return 1;
        if (this.cache.has(pattern)) return this.cache.get(pattern);

        let ways = 0;
        for (let t of this.types) {
            if (pattern.startsWith(t)) {
                ways += this.countCompose(pattern.substring(t.length));
            }
        }

        this.cache.set(pattern, ways);
        return ways;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-2;
        let pattern = this.lines[this.stepNumber+1];
        let ways = this.countCompose(pattern);
        if (ways > this.maxWays) this.maxWays = ways;
        //this.log(`[${this.stepNumber}]: ${pattern} - ${ways}`);
        this.count += ways;
        if (!moreToDo) {
            this.result = this.count.toString();
            this.log(`Maximum ways: ${this.maxWays}`);
            this.log(`Cache size: ${this.cache.size}`);
        }
        return moreToDo;
    }
}