import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class a201913 extends AoCPuzzle {
  ic: IC;
  grid: number[][] = [];
  score = 0;
  ball = {x: 0, y: 0};
  paddle = 0;
  sampleMode(): void { };

  output() {
    for (let y=0; y<this.grid.length; y++) {
      let line = '';
      for (let x=0; x<this.grid[0].length; x++) {
        let t = this.grid[y][x]??0;
        let ch = ' '; // empty space
        switch (t) {
          case 1: ch = '█'; break; // wall
          case 2: ch = '▒'; break; // block to destroy
          case 3: ch = '_'; break; // paddle
          case 4: ch = '•'; break; // ball
        }
        line += ch;
      }
      console.log(line);
    }
  }

  _loadData(lines: string[]) {
    this.ic = new IC(lines[0]);
  }

  _runStep(): boolean {
    let state = this.ic.run();
    let cnt = 0;
    console.log({state});
    console.log(`output:`, this.ic.output);
    for (let i=0; i<this.ic.output.length; i+=3) {
      let [x, y, t] = this.ic.output.slice(i);
      if (this.grid[y] === undefined) this.grid[y] = [];
      this.grid[y][x] = t;
      if (t === 2) cnt++;
    }
    this.output();
    this.result = cnt.toString();
    return false;
  }
}