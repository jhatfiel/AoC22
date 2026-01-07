import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Asteroid {
  r: number
  c: number
  sees: Asteroid[];
}

export class a201910 extends AoCPuzzle {
  grid: boolean[][];
  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.grid = lines.map(line => line.split('').map(ch => ch==='#'));
  }

  _runStep(): boolean {
    const numRows = this.grid.length;
    const numCols = this.grid[0].length;
    const asteroids: Asteroid[] = [];
    for (let r=0; r<numRows; r++) {
      for (let c=0; c<numCols; c++) {
        if (this.grid[r][c]) {
          asteroids.push({r,c,sees: []});
        }
      }
    }

    asteroids.forEach((a, i) => {
      const slopes: number[] = [];
      asteroids.slice(i+1).forEach(t => {
        const slope = (a.r-t.r)/(a.c-t.c);
        if (!slopes.includes(slope)) {
          slopes.push(slope);
          a.sees.push(t);
          t.sees.push(a);
        }
      })
    })

    const best = asteroids.reduce((best, a) => best=a.sees.length>best.sees.length?a:best, asteroids[0]);
    console.log(`Best asteroid is at ${best.r},${best.c} and it can see ${best.sees.length} others`);
    this.result = best.sees.length.toString();
    return false;
  }
}