import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

export class a201917 extends AoCPuzzle {
  grid: boolean[][];
  sampleMode(): void { };

  _loadData(lines: string[]) {
    let gridLines = lines;
    if (!this.inSampleMode) {
      // run the ic and get the grid that way
      const ic = new IC(lines[0]);
      ic.run();

      gridLines = [];
      let line = '';
      for (let i=0; i<ic.output.length; i++) {
        const ch = ic.output[i];
        if (ch === 10) {if (line) gridLines.push(line); line = '';}
        else line += String.fromCharCode(ch);
      }
    }

    // parse the grid
    this.grid = Array.from({length: gridLines.length}, _ => new Array(gridLines[0].length).fill(false));
    console.log(`Grid: \n${gridLines.join('\n')}`);
    gridLines.forEach((line, y) => {
      line.split('').forEach((ch, x) => {
        if (ch !== '.') this.grid[y][x] = true;
      });
    });
  }

  _runStep(): boolean {
    let sum = 0;
    for (let y=0; y<this.grid.length; y++) {
      for (let x=0; x<this.grid[0].length; x++) {
        if (this.grid[y][x] && (
          (x>0 && this.grid[y][x-1]) &&
          (y>0 && this.grid[y-1][x]) &&
          (x<this.grid[0].length-1 && this.grid[y][x+1]) &&
          (y<this.grid.length-1 && this.grid[y+1][x])
        )) {
          sum += x*y;
        }
      }
    }
    this.result = sum.toString();
    return false;
  }
}