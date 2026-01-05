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
      console.log(`------ Amp pass ${amp} ------ states:`)
      for (const state of space) {
        let signal = '';
        for (let i=0; i<this.numAmps; i++) {
          signal += state.used[i]===undefined?' ':state.used[i];
        }
        console.log(`${signal} ${state.output}`);
      }
      console.log(`-------------------------------------`)
      for (const state of space) {
        for (let ps=0; ps<this.numAmps; ps++) {
          if (state.used.indexOf(ps) !== -1) continue;
          const inputs = [ps, state.output];
          let output: number;
          let ic = new IC(this.prog, {readint: () => inputs.shift(), writeint: (n: number) => output=n})
          ic.run();
          newSpace.push({used: [...state.used, ps], output});
        }
      }
      space = newSpace;
    }
    let max = -Infinity;
    let maxSignal = '';
    for (const state of space) {
      let signal = '';
      for (let i=0; i<this.numAmps; i++) {
        signal += state.used[i]===undefined?' ':state.used[i];
      }
      if (state.output > max) {
        max = state.output;
        maxSignal = signal;
      }
    }
    this.result = max.toString();
    return false;
  }
}