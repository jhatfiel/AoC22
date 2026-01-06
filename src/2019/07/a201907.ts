import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

interface State {
  used: number[]
  output: number
}

export class a201907 extends AoCPuzzle {
  prog: string;
  numAmps = 5;

  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.prog = lines[0];
  }

  _runStep(): boolean {
    let space: State[] = [{used: [], output: 0}];
    for (let amp=0; amp<this.numAmps; amp++) {
      let newSpace: State[] = [];
      for (const state of space) {
        for (let ps=0; ps<this.numAmps; ps++) {
          if (state.used.indexOf(ps) !== -1) continue;
          const input = [ps, state.output];
          let ic = new IC(this.prog, {input});
          ic.run();
          newSpace.push({used: [...state.used, ps], output: ic.output[0]});
        }
      }
      space = newSpace;
    }
    let max = -Infinity;
    for (const state of space) {
      if (state.output > max) {
        max = state.output;
      }
    }
    this.result = max.toString();
    return false;
  }
}