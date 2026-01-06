import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b201908 extends AoCPuzzle {
  numCols = 25;
  numRows = 6;
  pixels: number[][][];
  minLayer = 0;
  minZeroes = Infinity;
  numLayers = 0;

  sampleMode(): void { this.numCols = 2; this.numRows = 2; };

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

  display() {
    for (let r=0; r<this.numRows; r++) {
      let line = '';
      for (let c=0; c<this.numCols; c++) {
        let ch = ' ';
        for (let layerNum=0; layerNum<this.numLayers; layerNum++) {
          let v = this.pixels[layerNum][r][c];
          if (v === 2) continue;
          ch = v===0?' ':'@';
          break;
        }
        line += ch;
      }
      console.log(line);
    }
  }

  _runStep(): boolean {
    this.display();
    return false;
  }
}