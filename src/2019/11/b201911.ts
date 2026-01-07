import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

const SIZE=200;

export class b201911 extends AoCPuzzle {
  facing = 0; // N/E/S/W
  delta = [[0,-1],[1,0],[0,1],[-1,0]];
  minX = Infinity;
  minY = Infinity;
  maxX = -Infinity;
  maxY = -Infinity;
  x = SIZE/2;
  y = SIZE/2;
  painted = new Set<string>();
  grid = Array.from({length: SIZE}, _ => Array(SIZE).fill(0));
  ic: IC;
  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.ic = new IC(lines[0]);
    this.grid[this.y][this.x] = 1;
  }

  output() {
    for (let y=this.minY; y<=this.maxY; y++) {
      let line='';
      for (let x=this.minX; x<=this.maxX; x++) {
        line += this.grid[y][x]===1?'█':' ';
      }
      console.log(line);
    }

  }

  turn(d: number) {
    if (d) this.facing++;
    else this.facing--;
    this.facing = (this.facing+4)%4;
    this.x += this.delta[this.facing][0];
    this.y += this.delta[this.facing][1];
    if (this.x < this.minX) this.minX = this.x;
    if (this.x > this.maxX) this.maxX = this.x;
    if (this.y < this.minY) this.minY = this.y;
    if (this.y > this.maxY) this.maxY = this.y;
  }

  _runStep(): boolean {
    const current = this.grid[this.y][this.x];
    //console.log(`[${this.stepNumber.toString().padStart(6)}] Currently at: ${this.x},${this.y} = ${current}`);
    this.ic.input.push(current);

    let state = this.ic.run({haltOnOutput: true});

    if (state !== 'HALTED') {
      //console.log(`${' '.repeat(8)} Brain say paint=${paint} ${state}`);
      const paint = this.ic.output.shift();
      this.grid[this.y][this.x] = paint;
      this.painted.add(`${this.x},${this.y}`);

      state = this.ic.run({haltOnOutput: true});
      const turn = this.ic.output.shift();
      //console.log(`${' '.repeat(8)} Brain say turn=${turn} ${state}`);
      this.turn(turn);
    }

    if (this.stepNumber > 10000 || state === 'HALTED') {
      console.log(`Final boundary: ${this.minX}-${this.maxX}, ${this.minY}-${this.maxY}`);
      this.output();
      this.result = this.painted.size.toString();
      return false;
    } else {
      return true;
    }
  }
}