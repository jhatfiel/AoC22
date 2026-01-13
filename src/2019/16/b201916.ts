import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b201916 extends AoCPuzzle {
  sampleMode(): void { };

  _loadData(lines: string[]) { }

  fft(digits: number[], buf: number[]) {
    let arr = digits;
    for (let i=0; i<digits.length; i++) {
      let sum = 0;
      //let line = '';
      // for i=0, we want to add n=0, 4, 8, ... and subtract n=2,6,10, ...
      // for i=1, we want to add n=1,2, 9,10, ... and subtract n=5,6, 13,14, ...
      // for i=2, we want to add n=2,3,4 14,15,16, ... and subtract n=8,9,10, 20,21,22, ...
      let n=i;
      let x=0;
      while (n < arr.length) {
        //line += `${arr[n]}(${n}) + `
        sum += arr[n];
        x++;
        if (x === (i+1)) {
          x = 0;
          n += 4*(i+1)-i;
        } else n++;
      }

      //line = line.substring(0, line.length-3) + ' - ';
      n=i+2*(i+1);
      x=0;
      while (n < arr.length) {
        //line += `${arr[n]}(${n}) - `
        sum -= arr[n];
        x++;
        if (x === (i+1)) {
          x = 0;
          n += 4*(i+1)-i;
        } else n++;
      }

      /*
      for (let n=0; n<arr.length; n++) {
        if (subInd > i) {subInd = 0; patInd++; if (patInd === pat.length) patInd=0;}
        const d = arr[n];
        //line += `${d}*${pat[patInd]}(${patInd}) + `;
        sum += d*pat[patInd];
        subInd++;
      }
      */
      sum = Math.abs(sum)%10;
      //line = line.substring(0, line.length-3) + ' = ' + sum;
      //console.log(line);
      buf[i] = sum;
    }
  }

  // fake process that just adds the remaining digits together at each position
  fftFake(digits: number[]) {
    let sum = 0;
    for (let n=digits.length-1; n>=0; n--) {
      sum += digits[n];
      sum %= 10;
      digits[n] = sum;
    }
  }

  _runStep(): boolean {
    const str = this.lines[0];
    let startAt = Number(str.substring(0,7));
    const strLen = str.length;
    const neededLength = 10000*strLen - startAt;
    const trailingCopies = neededLength/strLen;
    const dig2 = (str.substring(startAt%str.length)+str.repeat(trailingCopies)).split('').map(Number);
    // console.log(`Asking for ${startAt} of digits which is ${dig2.length} long`);
    // console.log(`${'0'.padStart(4)}:`, dig2.slice(0, 20).join(''), '...', dig2.slice(-20).join(''), `length: ${dig2.length}`);
    for (let i=0; i<100; i++) {
      this.fftFake(dig2);
      //console.log(`${(i+1).toString().padStart(4)}:`, dig2.slice(0, 20).join(''), '...', dig2.slice(-20).join(''));
    }
    this.result = dig2.slice(0,8).join('');

    return false;
  }
}