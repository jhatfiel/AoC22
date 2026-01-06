import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class b201902 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) {
        const ic = new IC(lines[0]);
        //ic.debug();
    }

    _runStep(): boolean {
        OUTER: for (let noun=0; noun<100; noun++) {
            for (let verb=0; verb<100; verb++) {
                const ic = new IC(this.lines[0]);
                ic.mem[1] = noun;
                ic.mem[2] = verb;
                ic.run();
                let result = ic.mem[0];
                if (result === 19690720) {
                    console.log(`Found noun=${noun} and verb=${verb}`);
                    this.result = `${noun}${verb}`;
                    break OUTER
                }
            }
        }

        return false;
    }
}