import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

const SIZE=2000;
interface Pair {x: number, y: number};
const PairToKey = (p: Pair) => `${p.x},${p.y}`;

export class a201915 extends AoCPuzzle {
  ic: IC;
  delta = [[], [0,-1],[0,1],[-1,0],[1,0]]; // 1=N, 2=S, 3=W, 4=E
  min: Pair = {x: SIZE/2-30, y: SIZE/2-8};
  max: Pair = {x: SIZE/2+30, y: SIZE/2+8};
  grid = Array.from({length: SIZE}, _ => Array(SIZE).fill(0));
  pos: Pair = {x: SIZE/2, y: SIZE/2};
  oxPos: Pair;
  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.ic = new IC(lines[0]);
    this.grid[this.pos.y][this.pos.x] = 1;
  }

  outputGrid() {
    const lines: string[] = [];
    const char = '? █'.split('');

    for (let y=this.min.y; y<=this.max.y; y++) {
      let line='';
      for (let x=this.min.x; x<=this.max.x; x++) {
        line += this.pos.x===x && this.pos.y===y?'@':char[this.grid[y][x]];
      }
      lines.push(line);
    }
    console.log(lines.join('\n'));
  }

  pathToNearestUnknown(): number[] {
    let target: Pair;
    let frontier: Pair[] = [this.pos];
    const seen = new Set<string>();
    const parent = new Map<string, Pair>();
    const getNeighbors = (p: Pair) => {
      return [[0,-1],[0,1],[-1,0],[1,0]]
        .map(([xd,yd]) => ({x:p.x+xd,y:p.y+yd}))
        .filter(({x,y}) => this.grid[y][x] !== 2)
    }
    
    OUTER: while (frontier.length) {
      const newFrontier: Pair[] = [];
      for (let node of frontier) {
        seen.add(PairToKey(node));
        for (let child of getNeighbors(node)) {
          const childKey = PairToKey(child);
          if (!seen.has(childKey) && ![...newFrontier, ...frontier].find(p => p.x===child.x && p.y===child.y)) {
            parent.set(childKey, node);
            newFrontier.push(child);
            if (this.grid[child.y][child.x] === 0) {
              //console.log(`BFS found`, child);
              target = child;
              break OUTER; // found one to go investigate
            }
          }
        }
      }

      frontier = newFrontier;
    }

    if (target) {
      const steps: number[] = [];
      //console.log(`direction path getting from ${JSON.stringify(this.pos)} to ${JSON.stringify(target)}`)
      while (true) {
        const prev = parent.get(PairToKey(target));
        //console.log(`prev is`, prev);
        if (!prev) break;
        steps.push(prev.y>target.y?1:prev.y<target.y?2:prev.x>target.x?3:4);
        target = prev;
      }
      return steps.reverse();
    } else {
      return undefined;
    }
  }

  pathToOxygenSensor(startPos): number[] {
    let target: Pair;
    let frontier: Pair[] = [startPos];
    const seen = new Set<string>();
    const parent = new Map<string, Pair>();
    const getNeighbors = (p: Pair) => {
      return [[0,-1],[0,1],[-1,0],[1,0]]
        .map(([xd,yd]) => ({x:p.x+xd,y:p.y+yd}))
        .filter(({x,y}) => this.grid[y][x] !== 2)
    }
    
    OUTER: while (frontier.length) {
      const newFrontier: Pair[] = [];
      for (let node of frontier) {
        seen.add(PairToKey(node));
        for (let child of getNeighbors(node)) {
          const childKey = PairToKey(child);
          if (!seen.has(childKey) && ![...newFrontier, ...frontier].find(p => p.x===child.x && p.y===child.y)) {
            parent.set(childKey, node);
            newFrontier.push(child);
            if (child.x === this.oxPos.x && child.y === this.oxPos.y) {
              //console.log(`BFS found ox`, child);
              target = child;
              break OUTER; // found it
            }
          }
        }
      }

      frontier = newFrontier;
    }

    if (target) {
      const steps: number[] = [];
      while (true) {
        const prev = parent.get(PairToKey(target));
        if (!prev) break;
        steps.push(prev.y>target.y?1:prev.y<target.y?2:prev.x>target.x?3:4);
        target = prev;
      }
      return steps.reverse();
    } else {
      return undefined;
    }
  }

  maxDepthFrom(startPos): number {
    let frontier: Pair[] = [startPos];
    const seen = new Set<string>();
    const parent = new Map<string, Pair>();
    const getNeighbors = (p: Pair) => {
      return [[0,-1],[0,1],[-1,0],[1,0]]
        .map(([xd,yd]) => ({x:p.x+xd,y:p.y+yd}))
        .filter(({x,y}) => this.grid[y][x] !== 2)
    }
    let depth = 0;
    
    while (frontier.length) {
      const newFrontier: Pair[] = [];
      for (let node of frontier) {
        seen.add(PairToKey(node));
        for (let child of getNeighbors(node)) {
          const childKey = PairToKey(child);
          if (!seen.has(childKey) && ![...newFrontier, ...frontier].find(p => p.x===child.x && p.y===child.y)) {
            parent.set(childKey, node);
            newFrontier.push(child);
          }
        }
      }

      frontier = newFrontier;
      if (frontier.length) depth++;
    }

    return depth;
  }

  applyDir(pos: Pair, dir: number) {
    pos.x += this.delta[dir][0];
    pos.y += this.delta[dir][1];
    if (pos.x < this.min.x) this.min.x = pos.x;
    if (pos.x > this.max.x) this.max.x = pos.x;
    if (pos.y < this.min.y) this.min.y = pos.y;
    if (pos.y > this.max.y) this.max.y = pos.y;
  }

  followPath(path: number[]) {
    path.map(p=>this.delta[p]).forEach(d => { this.pos.x += d[0]; this.pos.y += d[1]; });
  }

  _runStep(): boolean {
    // BFS out to the first reachable unknown spot and navigate there
    const startPos = {...this.pos};

    while (true) {
      const path = this.pathToNearestUnknown();
      if (!path) break;
      //console.log(`Let's navigate!`, path);
      this.ic.input = [...path];
      const finalDir = path.pop();
      this.followPath(path);
      this.ic.run(); // should consume the inputs and get us to the target square
      const finalResult = this.ic.output.pop();
      if (this.ic.output.some(v => v === 0)) throw new Error(`We were not able to move!`)
      this.ic.output = [];
      //console.log(`When trying final move: ${finalDir}, result was ${finalResult}`);
      const targetPos = {...this.pos};
      this.applyDir(targetPos, finalDir);
      if (finalResult === 0) {
        this.grid[targetPos.y][targetPos.x] = 2;
      } else {
        this.pos = targetPos;
        if (finalResult === 2) {
          this.oxPos = {...targetPos};
        }
        this.grid[targetPos.y][targetPos.x] = 1;
      }
  
      //console.log(`New grid`);
      //this.outputGrid();
    }

    let path = this.pathToOxygenSensor(startPos);
    console.log(`Part 1: ${path.length}`);

    // 293 is too high
    let maxDepth = this.maxDepthFrom(this.oxPos);
    console.log(`Part 2: ${maxDepth}`)

    this.result = maxDepth.toString();
    return false;
  }
}