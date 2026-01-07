import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { LCM } from '../../lib/numberTheory.js';

interface Triple {
  x: number
  y: number
  z: number
}

interface Planet {
  pos: Triple
  vel: Triple
}

const Triple2String = (t: Triple) => `x=${t.x.toString().padStart(3)}, y=${t.y.toString().padStart(3)}, z=${t.z.toString().padStart(3)}`;
const Planet2String = (p: Planet) => `pos=<${Triple2String(p.pos)}>, vel=<${Triple2String(p.vel)}>`

export class b201912 extends AoCPuzzle {
  planets: Planet[];
  seen: {
    x: Map<string, number>;
    y: Map<string, number>;
    z: Map<string, number>;
  }
  cycle: Triple = {x: undefined, y: undefined, z: undefined}

  sampleMode(): void { };

  _loadData(lines: string[]) {
      this.planets = lines.map(line => {
        const arr = line.split('=');
        const [_, x, y, z] = arr.map(s => Number.parseInt(s));
        return {pos: {x,y,z}, vel: {x: 0, y: 0, z: 0}};
      })
      this.seen = {x: new Map<string, number>(), y: new Map<string, number>(), z: new Map<string, number>()};
  }

  calcGravity() {
    for (let i=0; i<this.planets.length-1; i++) {
      const p = this.planets[i];
      for (let j=i+1; j<this.planets.length; j++) {
        const q = this.planets[j];
        for (const axis of ['x','y','z'] as ('x'|'y'|'z')[]) {
          const sign = Math.sign(q.pos[axis] - p.pos[axis]);
          p.vel[axis] += sign;
          q.vel[axis] -= sign;
        }
      }
    }
  }

  movePlanets() {
    for (let i=0; i<this.planets.length; i++) {
      const p = this.planets[i];
      for (const axis of ['x','y','z'] as ('x'|'y'|'z')[]) p.pos[axis] += p.vel[axis];
    }
  }

  output(msg: string) {
    console.log(msg);
    this.planets.forEach(p => console.log(Planet2String(p)));
  }

  _runStep(): boolean {

    // calculate cycles
    for (const axis of ['x','y','z'] as ('x'|'y'|'z')[]) {
      if (this.cycle[axis] !== undefined) continue;
      let key = '';
      for (let i=0; i<this.planets.length; i++) {
        const p = this.planets[i];
        key += `${p.pos[axis]},${p.vel[axis]},`;
      }
      const prev = this.seen[axis].get(key);
      if (prev !== undefined) {
        console.log(`${axis} cycle length = ${this.stepNumber}-${prev}=${this.stepNumber-prev}`);
        this.cycle[axis] = this.stepNumber-prev;
      }
      this.seen[axis].set(key, this.stepNumber);
    }

    //this.output(`After ${this.stepNumber-1} steps:`);

    let moreToDo = this.cycle.x===undefined || this.cycle.y===undefined || this.cycle.z===undefined;
    if (moreToDo) {
      this.calcGravity();
      this.movePlanets();
    }

    if (!moreToDo) {
      this.result = LCM(this.cycle.x, this.cycle.y, this.cycle.z).toString();
    }
    return moreToDo;
  }
}