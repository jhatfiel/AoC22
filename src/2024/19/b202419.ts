import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202419 extends AoCPuzzle {
    types: string[];
    count = 0n;
    cache = new Map<string, bigint>();
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.types = lines[0].split(', ');
    }

    countCompose(pattern: string, pos: number): bigint {
        if (pos >= pattern.length) return 1n;
        let sub = pattern.substring(pos);
        if (this.cache.has(sub)) return this.cache.get(sub);

        let ways = 0n;
        for (let t of this.types) {
            if (sub.startsWith(t)) {
                ways += this.countCompose(pattern, pos+t.length);
            }
        }

        this.cache.set(sub, ways);
        return ways;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-2;
        let pattern = this.lines[this.stepNumber+1];
        let ways = this.countCompose(pattern, 0);
        //this.log(`[${this.stepNumber}]: ${pattern} - ${ways}`);
        this.count += ways;
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}