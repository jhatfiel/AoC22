import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202419 extends AoCPuzzle {
    types: string[];
    count = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.types = lines[0].split(', ');
    }

    canCompose(pattern: string): boolean {
        if (pattern.length === 0) return true;
        for (let t of this.types) {
            if (pattern.startsWith(t) && this.canCompose(pattern.substring(t.length))) {
                return true;
            }
        }
        return false;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-2;
        let pattern = this.lines[this.stepNumber+1];
        let canCompose = this.canCompose(pattern);
        //this.log(`[${this.stepNumber}]: ${pattern} ${canCompose}`);
        if (canCompose) this.count++;
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}