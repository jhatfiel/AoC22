import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class a201909 extends AoCPuzzle {
  sampleMode(): void { };

  _loadData(lines: string[]) {
  }

  _runStep(): boolean {
    let ic = new IC(this.lines[0], {input: [1]});
    ic.run();
    console.log('Part 1:', ic.output);
    ic = new IC(this.lines[0], {input: [2]});
    ic.run();
    console.log('Part 2:', ic.output);
    this.result = ic.output[0].toString();
    return false;
  }
}