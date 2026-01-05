import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { AsyncQueue } from '../AsyncQueue.js';
import { IC } from '../intcode.js';

interface State {
  used: number[]
  output: number
}

export class b201907 extends AoCPuzzle {
  prog: string;
  numAmps = 5;

  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.prog = lines[0];
  }

  _runStep(): boolean {
    const gen = Permutations([5,6,7,8,9]);
    (async () => {
      let max = -Infinity;
      for (const nextPerm of gen) {
        //console.log(`Phase setting sequence: ${nextPerm.join(',')}`)
        let input: AsyncQueue[] = Array.from({length: this.numAmps}, () => new AsyncQueue());
        let ics: IC[] = [];
        let promises: Promise<number>[] = [];
        for (let i=0; i<this.numAmps; i++) {
          input[i].enqueue(nextPerm[i]);
        }
        input[0].enqueue(0); // initial input
  
        for (let i=0; i<this.numAmps; i++) {
          const inQ = input[i];
          const outN = (i+1)%this.numAmps;
          const outQ = input[outN];
          const ic = new IC(this.prog, {
            readint: async () => {
              const v = await inQ.dequeue();
              if (v === null) throw new Error(`[${i}] Input queue closed`);
              return v;
            },
            writeint: (n: number) => outQ.enqueue(n)
          });
          promises.push(ic.run().finally(() => outQ.close()));
          ics.push(ic);
        }

        await Promise.all(promises);

        const output = await input[0].dequeue();
        if (output > max) {
          max = output;
          console.log(nextPerm.join(','), `: new best: ${max}`);
        }

      }
    })();

    return false;
  }

}