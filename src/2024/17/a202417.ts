import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { TBC } from './tbc.js';

export class a202417 extends AoCPuzzle {
    tbc: TBC;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.tbc = new TBC({lines});
        this.log(`PROGRAM:`);
        this.log(this.tbc.disassemble().join('\n'));
        this.log(`END:`);
    }

    _runStep(): boolean {
        let moreToDo = !this.tbc.halted();

        if (moreToDo) {
            //this.tbc.debug();
            this.log(this.tbc.getCurrentCommandValue());
            this.tbc.step();
        } else {
            this.result = this.tbc.out.join(',');
        }
        return moreToDo;
    }
}