import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class a202601 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) {
        
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        if (!moreToDo) {
            this.result = 'Result';
        }
        return moreToDo;
    }
}