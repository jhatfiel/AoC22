import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { IC, STATE_HALTED } from '../intcode.js';

interface State {
  used: number[]
  output: number
}

export class b201907 extends AoCPuzzle {
  prog: string;
  numAmps = 5;
  gen = Permutations([5,6,7,8,9]);
  max = -Infinity;

  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.prog = lines[0];
  }

  _runStep(): boolean {
    const nextPermIter = this.gen.next();
    const nextPerm = nextPermIter.value;
    const moreToDo = nextPerm !== undefined;
    if (moreToDo) {
      const input: number[][] = nextPerm.map(v=>[v]);
      const ics: IC[] = Array.from({length: this.numAmps}, 
        (_, i) => new IC(this.prog, { readint: () => input[i].shift() , writeint: (n: number) => input[(i+1)%this.numAmps].push(n) }))

      input[0].push(0); // initialize amp A
      let executingIC = 0;

      while (true) {
        const ic = ics[executingIC];
        const nextIC = (executingIC+1)%this.numAmps;
        const state = ic.run(); // run to halt or next output, then run the next ic
        //console.log(`${executingIC} state=${state}`)
        if (state === STATE_HALTED) {
          if (input[0][0] > this.max) this.max = input[0][0];
          break;
        }

        executingIC = nextIC;
      }
    } else {
      this.result = this.max.toString();
    }

    return moreToDo;
  }

}