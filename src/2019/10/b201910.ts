import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Asteroid {
  y: number
  x: number
  sees: Map<number, Map<number, Asteroid>> // bearing -> distance -> Asteroid
}

export class b201910 extends AoCPuzzle {
  grid: boolean[][];
  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.grid = lines.map(line => line.split('').map(ch => ch==='#'));
  }

  _runStep(): boolean {
    const numRows = this.grid.length;
    const numCols = this.grid[0].length;
    const asteroids: Asteroid[] = [];
    for (let y=0; y<numRows; y++) {
      for (let x=0; x<numCols; x++) {
        if (this.grid[y][x]) {
          asteroids.push({y,x,sees: new Map<number, Map<number, Asteroid>>()});
        }
      }
    }

    // from part 1 - we determined that the best asteroid is at 19,23 - so that is our start asteroid
    /* can we calculate the bearing for each asteroid?
    normally we could do this (with a standard x/y plot graph)
    ^   +  /
  +y|   | /|
    |   |/t|y  tan(t) = y/x => arctan(y/x) = t, arctan gives us angles between -90 (4th quadrant) and 90 (1st quadrant) so we add 360 if x is negative
    -------+-
    |   | x
  -y|   |
    v
    but with "bearing" which is north based AND clockwise and we want north to be "negative" y in direction, we have to change it up some

         x
    ^   +--/
  -y|  y|t/ 
    |   |/     tan(t) = x/(-y) => atan2(x, -1*y) = t (then add 2*PI if x was negative)
    -------+-
    |   |  
  +y|   |
    v

    */

    const a = asteroids.find(a => a.x === 23 && a.y === 19);
    //const a = asteroids.find(a => a.x === 11 && a.y === 13);
    asteroids.forEach((t, j) => {
      const dy = t.y-a.y;
      const dx = t.x-a.x;
      if (dy === 0 && dx === 0) return;
      const bearing = ((dx<0)?2*Math.PI:0)+Math.atan2(dx, -1*dy);

      //console.log(`${a.x},${a.y} to ${t.x},${t.y} / dx=${dx}, dy=${dy} => bearing is ${bearing}`);
      let bearingMap = a.sees.get(bearing);
      if (!bearingMap) {
        bearingMap = new Map<number, Asteroid>();
        a.sees.set(bearing, bearingMap);
      }
      bearingMap.set(dy**2+dx**2, t);
    })
    console.log(`Asteroid is at ${a.x},${a.y} and it can see ${a.sees.size} others`);

    let cnt = 1;
    for (let bearing of [...a.sees.keys()].sort()) {
      const bearingMap = a.sees.get(bearing);
      const closestDistance = [...bearingMap.keys()].sort((a,b)=>a-b).at(0);
      const t = bearingMap.get(closestDistance);
      //console.log(`The [${cnt.toString().padStart(3)}] asteroid to be vaporized is at ${t.x},${t.y}, bearing ${bearing}, with distance=${closestDistance}, ${JSON.stringify([...bearingMap])}`);
      if (cnt === 200) this.result = (t.x * 100 + t.y).toString();
      cnt++;
    }


    return false;
  }
}