import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a201916 extends AoCPuzzle {
  sampleMode(): void { };

  _loadData(lines: string[]) { }

  fft(digits: number[], pat: number[]): number[] {
    return digits.map((_, i, arr) => {
      let sum = 0;
      //let line = '';
      for (let n=0; n<arr.length; n++) {
        const patInd = (Math.floor((n+1)/(i+1)))%pat.length;
        const d = arr[n];
        //line += `${d}*${pat[patInd]}(${patInd}) + `;
        sum += d*pat[patInd];
      }
      sum = Math.abs(sum%10);
      //line = line.substring(0, line.length-3) + ' = ' + sum;
      //console.log(line);
      return sum%10;
    })
  }

  _runStep(): boolean {
    let digits = this.lines[0].split('').map(Number);
    const pat = [0,1,0,-1];

    console.log(`orig:`, digits);
    for (let i=0; i<100; i++) {
      digits = this.fft(digits, pat);
      console.log(`${(i+1).toString().padStart(4)}:`, digits.join(''));
    }
    this.result = digits.slice(0,8).join('');

    return false;
  }
}