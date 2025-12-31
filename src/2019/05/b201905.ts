import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class b201905 extends AoCPuzzle {
    ic: IC;
    sampleMode(): void { };

    _loadData(lines: string[]) {
      this.ic = new IC(lines[0], {
        readint: () => 5,
        writeint: (n: number) => {console.log(`IC says ${n}`); this.result = `${n}`}
      });
    }

    _runStep(): boolean {
        let moreToDo = false;
        this.ic.run(true);
        return moreToDo;
    }
}