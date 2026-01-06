import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class a201905 extends AoCPuzzle {
    ic: IC;
    sampleMode(): void { };

    _loadData(lines: string[]) {
      this.ic = new IC(lines[0], {input: [1]});
    }

    _runStep(): boolean {
        let moreToDo = false;
        this.ic.run();
        this.result = this.ic.output.at(-1).toString();
        return moreToDo;
    }
}