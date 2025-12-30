import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

const move = {
  'U': ([x,y]) => [x,y-1],
  'R': ([x,y]) => [x+1,y],
  'D': ([x,y]) => [x,y+1],
  'L': ([x,y]) => [x-1,y],
}

export class b201903 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) {}

    _runStep(): boolean {
      // mark all of the first wire's locations
      let [x,y] = [0,0];
      let stepsTo = new Map<string, number>();
      let steps=0;
      for (let str of this.lines[0].split(',')) {
        let dir = str.charAt(0);
        let len = Number(str.substring(1));
        for (let i=0; i<len; i++) {
          [x,y] = move[dir]([x,y]);
          steps++;
          if (!stepsTo.has(`${x},${y}`)) stepsTo.set(`${x},${y}`, steps);
        }
      }

      [x,y] = [0,0];
      let lowest = Infinity;
      steps = 0;
      for (let str of this.lines[1].split(',')) {
        let dir = str.charAt(0);
        let len = Number(str.substring(1));
        for (let i=0; i<len; i++) {
          [x,y] = move[dir]([x,y]);
          steps++;
          const steps1 = stepsTo.get(`${x},${y}`);
          if (steps1) {
            console.log(`Second line crosses at ${x},${y} steps=${steps1} + ${steps}`);
            if (steps1 + steps < lowest) lowest = steps1 + steps
          }
        }
      }

      this.result = lowest.toString();
      return false;
    }
}