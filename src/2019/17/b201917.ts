import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { IC } from '../intcode.js';

interface Pair { x: number, y: number }
const DIR_MAP = {'^': 0, '>': 1, 'v': 2, '<': 3};
const DIR_DELTA = [[0,-1], [1,0], [0,1], [-1,0]];

let grid: boolean[][];
const crossings = new Set<string>();
const rightTurnDir = (d: number) => (d+1)%4;
const leftTurnDir = (d: number) => (d+3)%4;
const move = (pos: Pair, d: number) => ({x: pos.x+DIR_DELTA[d][0], y: pos.y+DIR_DELTA[d][1]});
const validDir = (d: number, from: Pair) => {
  const delta = DIR_DELTA[d];
  const [newx, newy] = [from.x+delta[0], from.y+delta[1]];
  return newx >= 0 && newy >= 0 && newx < grid[0].length && newy < grid.length && grid[newy][newx];
}

export class b201917 extends AoCPuzzle {
  pos: Pair;
  dir: number;
  answer = [
'A,B,A,B,C,C,B,A,C,A', // Main movement routine
'L,10,R,8,R,6,R,10', // A
'L,12,R,8,L,12', // B
'L,10,R,8,R,8', // C
'n', // n
  ]

  sampleMode(): void { };

  _loadData(lines: string[]) {
    let gridLines = lines;
    if (!this.inSampleMode) {
      // run the ic and get the grid that way
      const ic = new IC(lines[0]);
      ic.run();

      gridLines = [];
      let line = '';
      for (let i=0; i<ic.output.length; i++) {
        const ch = ic.output[i];
        if (ch === 10) {if (line) gridLines.push(line); line = '';}
        else {
          line += String.fromCharCode(ch);
        }
      }
    }

    // parse the grid
    grid = Array.from({length: gridLines.length}, _ => new Array(gridLines[0].length).fill(false));
    console.log(`Grid: \n${gridLines.join('\n')}`);
    gridLines.forEach((line, y) => {
      line.split('').forEach((ch, x) => {
        if (DIR_MAP[ch] !== undefined) {
          this.pos = {x, y};
          this.dir = DIR_MAP[ch];
        }
        if (ch !== '.') grid[y][x] = true;
      });
    });
  }

  solve() {
    for (let y=0; y<grid.length; y++) {
      for (let x=0; x<grid[0].length; x++) {
        if (grid[y][x] && (
          (x>0 && grid[y][x-1]) &&
          (y>0 && grid[y-1][x]) &&
          (x<grid[0].length-1 && grid[y][x+1]) &&
          (y<grid.length-1 && grid[y+1][x])
        )) {
          crossings.add(`${x},${y}`);
        }
      }
    }
    console.log([...crossings.keys()].join(' / '));
    console.log(`pos:`, this.pos);

    let result = dfs({seen: new Set<string>, steps: [{duration: 0}], at: this.pos, dir: this.dir});
    const maxSeen = result.reduce((max, path) => max=Math.max(max, path.seen.size), 0);
    result = result.filter(path => path.seen.size === maxSeen);
    result.forEach(path => {
      const freq = new Map<string, number>();
      const str = path.steps.map(s => `${s.turn??''}${s.duration?s.duration:''}`).join('')
      //console.log(`${path.seen.size.toString().padStart(3)}: ${path.steps.map(s => `${s.turn??''}${s.duration?s.duration:''}`).join(' , ')}`);
      console.log(`str=${str}`);
      for (let i=0; i<str.length; i++) {
        for (let j=i+4; j<Math.min(i+11,str.length+1); j++) {
          const substr = str.substring(i, j);
          freq.set(substr, (freq.get(substr)??0)+1);
        }
      }
      //console.log(JSON.stringify([...freq.entries()]));
      //console.log(`Top 10`);
      const sortedSubs = [...freq.keys()].filter(s=>freq.get(s)>1).sort((a,b) => b.length>a.length?1:b.length<a.length?-1:freq.get(b)-freq.get(a));
      for (let i=0; i<Math.min(10, sortedSubs.length); i++) {
        const keyA = sortedSubs[i];
        const str2 = str.replaceAll(keyA, 'A');
        //console.log(` ${keyA}: ${freq.get(keyA)} => ${str2}`);
        const freq2 = new Map<string, number>();
        for (let a=0; a<str2.length; a++) {
          for (let b=a+4; b<Math.min(a+11,str2.length+1); b++) {
            const substr = str2.substring(a, b);
            freq2.set(substr, (freq2.get(substr)??0)+1);
          }
        }
        const sortedSubs2 = [...freq2.keys()].filter(s=>freq2.get(s)>1).sort((a,b) => b.length>a.length?1:b.length<a.length?-1:freq2.get(b)-freq2.get(a));
        for (let j=0; j<Math.min(10, sortedSubs2.length); j++) {
          const keyB = sortedSubs2[j];
          const str3 = str2.replaceAll(keyB, 'B');
          //console.log(`   ${keyB}: ${freq2.get(keyB)} => ${str3}`);
          const freq3 = new Map<string, number>();
          for (let a=0; a<str3.length; a++) {
            for (let b=a+4; b<Math.min(a+11,str3.length+1); b++) {
              const substr = str3.substring(a, b);
              freq3.set(substr, (freq3.get(substr)??0)+1);
            }
          }
          const sortedSubs3 = [...freq3.keys()].filter(s=>freq3.get(s)>1).sort((a,b) => b.length>a.length?1:b.length<a.length?-1:freq3.get(b)-freq3.get(a));
          for (let k=0; k<Math.min(10, sortedSubs3.length); k++) {
            const keyC = sortedSubs3[k];
            const str4 = str3.replaceAll(keyC, 'C');
            //console.log(`     ${keyC}: ${freq3.get(keyC)} => ${str4}`);
            if (!str4.match(/[^ABC]/)) {
              console.log(`!!!!!!!!!!!!!!!!!!!!!FOUND ANSWER!!!`)
              console.log(str4);
              console.log(keyA);
              console.log(keyB);
              console.log(keyC);
            }
          }
        }
      }
      
    })

  }

  getInput(): number[] {
    return this.answer.flatMap(line=>[...line.split('').map(ch=>ch.charCodeAt(0)), 10]);
  }

  _runStep(): boolean {
    const ic = new IC(this.lines[0], {input: this.getInput()});
    ic.mem[0] = 2;
    console.log(JSON.stringify(this.answer));
    console.log(JSON.stringify(ic.input));
    const status = ic.run();
    console.log({status})
    //console.log(JSON.stringify(ic.output.map(a=>String.fromCharCode(a))));
    console.log(ic.output.at(-1));
    this.result = ic.output.at(-1).toString();
    return false;
  }
}

interface Step {
  turn?: 'R'|'L'
  duration: number
}

interface Path {
  seen: Set<string>
  steps: Step[]
  at: Pair
  dir: number
}
const copyPath = (p: Path) => ({...p, seen: new Set(p.seen), steps: p.steps.map(s => ({...s}))});

const dfs = (path: Path): Path[] => {
  let result: Path[] = [];
  const atKey = `${path.at.x},${path.at.y}`;
  const straight = move(path.at, path.dir);
  const straightKey = `${straight.x},${straight.y}`;

  if (validDir(path.dir, path.at) && (crossings.has(straightKey) || !path.seen.has(straightKey))) { // done go where we have gone before unless it is a crossing
    let newPath = copyPath(path);
    const lastStep = newPath.steps.at(-1);
    lastStep.duration++;
    newPath.seen.add(atKey);
    newPath.at = move(newPath.at, newPath.dir);
    result.push(...dfs(newPath));
  } 

  const rightDir = rightTurnDir(path.dir);
  const right = move(path.at, rightDir);
  const rightKey = `${right.x},${right.y}`;

  if (validDir(rightDir, path.at) && (crossings.has(rightKey) || !path.seen.has(rightKey))) {
    let newPath = copyPath(path);
    newPath.dir = rightDir;
    newPath.steps.push({turn: 'R', duration: 1});
    newPath.seen.add(atKey);
    newPath.at = right;
    result.push(...dfs(newPath));
  }

  const leftDir = leftTurnDir(path.dir);
  const left = move(path.at, leftDir);
  const leftKey = `${left.x},${left.y}`;

  if (validDir(leftDir, path.at) && (crossings.has(leftKey) || !path.seen.has(leftKey))) {
    let newPath = copyPath(path);
    newPath.dir = leftDir;
    newPath.steps.push({turn: 'L', duration: 1});
    newPath.seen.add(atKey);
    newPath.at = left;
    result.push(...dfs(newPath));
  }

  
  if (result.length === 0) {
    result.push(path);
  }


  return result;
}