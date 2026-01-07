import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';
import * as Readline from 'node:readline';

export class b201913 extends AoCPuzzle {
  ic: IC;
  grid: number[][] = [];
  score = 0;
  ball = {x: 0, y: 0};
  paddle = 0;
  sampleMode(): void { };

  output() {
    let lines: string[] = ['SCORE: ' + this.score];
    for (let y=0; y<this.grid.length; y++) {
      let line = '';
      for (let x=0; x<this.grid[0].length; x++) {
        let t = this.grid[y][x]??0;
        let ch = ' '; // empty space
        switch (t) {
          case 1: ch = '█'; break; // wall
          case 2: ch = '▒'; break; // block to destroy
          case 3: ch = '^'; break; // paddle
          case 4: ch = '•'; break; // ball
        }
        //if (x>1 && this.grid[y][x-1] === 3) ch = '_';
        //if (x<this.grid[0].length-1 && this.grid[y][x+1] === 3) ch = '_';
        line += ch;
      }
      lines.push(line);
    }
    console.log(lines.join('\n'));
  }

  _loadData(lines: string[]) {
    this.ic = new IC(lines[0]);
    this.ic.mem[0] = 2; // free play!
  }

  _runStep(): boolean {
    Readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const readSingleChar = () => {
      return new Promise((resolve) => {
        const onKeypress = (str, key) => {
          process.stdin.off('keypress', onKeypress);
          resolve(str || key.name);
        }
        process.stdin.on('keypress', onKeypress);
        //console.log(`waiting for keypress....`)
      })
    }
    (async () => {

      let state = this.ic.run({haltOnInput: true});
      while (true) {
        //console.log(`output:`, this.ic.output);
        while (this.ic.output.length) {
          let [x, y, t] = this.ic.output.splice(0, 3);
          if (x === -1 && y === 0) {
            this.score = t;
            console.log(`SCORE:`, t);
            continue;
          }
          if (this.grid[y] === undefined) this.grid[y] = [];
          this.grid[y][x] = t;
        }
        if (state === 'INPUT') {
          console.log(`Input requested, current length=${this.ic.input.length}`);
          this.output();
          if (this.ic.input.length === 0) {
            const key = await readSingleChar();
            //console.log(`Async function captured: ${key}`)
            if (key === 'q') process.exit();
            this.ic.input.push(key==='left'?-1:key==='right'?1:0);
          }
          state = this.ic.run({haltOnInput: true});
        }
        if (state === 'HALTED') process.exit();;
        //console.log({state});
      }
    })()
    
    this.result = this.score.toString();
    return false;
  }
}