import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class a201902 extends AoCPuzzle {
    ic: IC;
    sampleMode(): void { };

    _loadData(lines: string[]) {
      this.ic = new IC(lines[0]);
      this.ic.mem[1] = 12;
      this.ic.mem[2] = 2;
      //this.ic.debug();
    }

    _runStep(): boolean {
        //console.log(`${this.stepNumber} calling ic.tick()`);
        //this.log(this.ic.mem.join());
        let moreToDo = this.ic.tick() !== 'HALTED';
        if (!moreToDo) {
            this.result = this.ic.mem[0].toString();
        }
        return moreToDo;
    }
}