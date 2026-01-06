import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a201908 extends AoCPuzzle {
  numCols = 25;
  numRows = 6;
  pixels: number[][][];
  minLayer = 0;
  minZeroes = Infinity;
  numLayers = 0;

  sampleMode(): void { this.numCols = 3; this.numRows = 2; };

  _loadData(lines: string[]) {
    const layerSize = this.numCols*this.numRows;
    this.numLayers = lines[0].length/layerSize;
    this.pixels = Array.from({length: this.numLayers}, _ => Array.from({length: this.numRows}, _ => []));
    let layerNum = 0;
    let r=0;
    let c=0;
    for (let i=0; i<lines[0].length; i++) {
      this.pixels[layerNum][r][c] = Number(lines[0].charAt(i));
      c++;
      if (c==this.numCols) { r++; c = 0; }
      if (r==this.numRows) { layerNum++; r = 0 }
    }
  }

  count(layer: number[][], n: number): number {
    let count = 0;
    for (let r=0; r<this.numRows; r++) {
      for (let c=0; c<this.numCols; c++) {
        if (layer[r][c] === n) count++;
      }
    }
    return count;
  }

  _runStep(): boolean {
    const layerNum = this.stepNumber-1;
    let moreToDo = layerNum < this.numLayers-1;
    const layer = this.pixels[layerNum];
    // count 0's
    // for the min 0 layer, calculate num 1's * num 2's
    const count = this.count(layer, 0);
    if (count < this.minZeroes) {
      this.minZeroes = count;
      this.minLayer = layerNum;
    }
    if (!moreToDo) {
      console.log(`Min layer: ${this.minLayer}`);
      const layer = this.pixels[this.minLayer];
      // 1755 is too high
      this.result = (this.count(layer, 1)*this.count(layer, 2)).toString();
    }
    return moreToDo;
  }
}