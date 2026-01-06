import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { IC } from '../intcode.js';

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
    //const ic = new IC(this.prog);
    //ic.disassemble();
  }

  _runStep(): boolean {
    const nextGen = this.gen.next();
    const phaseSetting = nextGen.value;
    const moreToDo = phaseSetting !== undefined;
    if (moreToDo) {
      const ics: IC[] = Array.from({length: this.numAmps}, _ => new IC(this.prog))
      phaseSetting.forEach((phase, i) => ics[i].input.push(phase));
      ics[0].input.push(0); // initialize amp A
      let executingIC = 0;

      while (true) {
        const ic = ics[executingIC];
        const nextIC = (executingIC+1)%this.numAmps;
        const state = ic.run({haltOnOutput: true});
        if (state === 'HALTED') {
          if (ics[0].input[0] > this.max) this.max = ics[0].input[0]
          break;
        }

        const output = ic.output.shift();
        if (output === undefined) throw new Error(`No output from amp ${executingIC}`);
        ics[nextIC].input.push(output);

        executingIC = nextIC;
      }
    } else {
      this.result = this.max.toString();
    }

    return moreToDo;
  }

}