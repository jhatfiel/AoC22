import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202419 extends AoCPuzzle {
    types: string[];
    count = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.types = lines[0].split(', ');
    }

    canCompose(pattern: string, pos: number): boolean {
        if (pos >= pattern.length) return true;
        for (let t of this.types) {
            if (pattern.substring(pos).startsWith(t) && this.canCompose(pattern, pos+t.length)) {
                return true;
            }
        }
        return false;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-2;
        let pattern = this.lines[this.stepNumber+1];
        this.log(`[${this.stepNumber}]: ${pattern}`);
        if (this.canCompose(pattern, 0)) this.count++;
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}