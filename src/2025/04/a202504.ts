import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser } from '../../lib/gridParser.js';

export class a202504 extends AoCPuzzle {
    gp: GridParser;
    count=0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/@/g]);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.gp.matches.length;
        const match = this.gp.matches[this.stepNumber-1];
        const neighbors = this.gp.getMatchNeighbors(match, 0);
        if (neighbors.length <= 4) this.count++;
        //console.log(`Step ${this.stepNumber}: Found match ${match.typeIndex} at (${match.x},${match.y}), neighbors=${neighbors.length}`);
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}