import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { BFS } from '../../lib/bfsearcher.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';
import { Dijkstra } from '../../lib/dijkstraBetter.js';

const toState = (pair: Pair, keys: string): string => `${PairToKey(pair)};${keys}`;
const fromState = (state: string): {pair: Pair, keys: string} => {
  let parts = state.split(';');
  return {pair: PairFromKey(parts[0]), keys: parts[1]};
}

export class a201918 extends AoCPuzzle {
  gp: GridParser;
  walls = new Set<string>();
  start: Pair;
  keys = new Map<string, Pair>();
  doors = new Map<string, Pair>();

  sampleMode(): void { };

  _loadData(lines: string[]) {
    this.gp = new GridParser(lines, [/#/g, /@/g, /[a-z]/g, /[A-Z]/g]); // 0=walls, 1=start, 2=keys, 3=doors
    this.gp.matches.forEach(m => {
      switch (m.typeIndex) {
        case 0: this.walls.add(PairToKey(m)); break;
        case 1: this.start = {x: m.x, y: m.y}; this.gp.grid[m.y][m.x] = '.'; break;
        case 2: this.keys.set(m.value, {x: m.x, y: m.y}); break;
        case 3: this.doors.set(m.value, {x: m.x, y: m.y}); break;
      }
    });
  }

  _runStep(): boolean {
    let start = Date.now();
    let bfsTimer = 0;
    let dupNode = 0;
    // const graph = new Map<string, Map<string, {cost: number, keys: string[]}>>();
    console.log(this.gp.grid.map(row=>row.map(ch=>ch==='.'?' ':ch).join('')).join('\n'));
    const nodeMapCache = new Map<string, Map<string, number>>();
    const dij = new Dijkstra((node) => {
      //console.log(`DIJ processing ${node}`)
      const [fromPairKey, keysPossessed] = node.split(';');
      //const nodeMap = graph.get(atKey);
      // replace call to nodeMap with calculation of BFS based on keysPossessed (caching results)
      let results = nodeMapCache.get(node);
      if (results === undefined) {
        results = new Map<string, number>();
        nodeMapCache.set(node, results);

        //const fromPair = atKey === '@' ? this.start : this.keys.get(atKey)!;
        //const fromPairKey = PairToKey(fromPair);
        // analyze how we would get from this pair to other pairs that have keys
        const bfs = new BFS((state) => {
          // console.log(`BFS ${state}`)
          const pair = PairFromKey(state.at);
          const result = new Map<string, number>();
          const ch = this.gp.grid[pair.y][pair.x];
          const isSpace = ch === '.';
          const isDoor = this.doors.has(ch);
          const isKey = this.keys.has(ch);
          if ( state.visited.size === 1 || // we can always move away from our start position
              isSpace ||  // we can move through open space
              (isDoor && keysPossessed.indexOf(ch.toLowerCase()) !== -1) || // we can move through doors we have keys for
              (isKey && keysPossessed.indexOf(ch) !== -1)) { // we can move through keys we have picked up (otherwise we need to stop at this key)
            this.gp.gridOrthogonalP(pair).forEach(([n]) => {
              if (this.gp.grid[n.y][n.x] !== '#') {
                // console.log(`  can go to ${PairToKey(n)}`);
                result.set(PairToKey(n), 1)
              }
            });
          }
          return result;
        }, ({at}) => {
          const pair = PairFromKey(at);
          const ch = this.gp.grid[pair.y][pair.x];

          // console.log(`Keeping terminal state: ${at}=${ch}=${this.keys.has(ch) && keysPossessed.indexOf(ch) === -1}`); // keep states that end at uncollected keys
          return this.keys.has(ch) && keysPossessed.indexOf(ch) === -1; // keep states that end at uncollected keys
        });

        const now = Date.now();
        const paths = bfs.getPathsFrom(fromPairKey);
        bfsTimer += Date.now() - now;
        paths.forEach(({at, cost}) => {
          const pair = PairFromKey(at);
          const toKey = this.gp.grid[pair.y][pair.x];
          //if (keyTo === '.' || this.doors.has(keyTo) || keyTo === atKey) return; // not a key path, or door, or same key
          const newKeysPossessed = keysPossessed.indexOf(toKey) === -1 ? (keysPossessed + toKey).split('').sort().join('') : keysPossessed;
          const newKey = `${at};${newKeysPossessed}`;
          // console.log(`- found path to ${at}(${newKey}) cost=${cost}`);
          results.set(newKey, cost);
        });
      } else {
        dupNode++;
      }

      // [...nodeMap.entries()].forEach(([toKey, {cost, keys}]) => {
      //   // console.log(`- to ${toKey} cost=${cost}, keysNeeded=${keys}`)
      //   if (/*keysPossessed.indexOf(toKey) === -1 && */keys.every(k => keysPossessed.indexOf(k) !== -1)) {
      //     const newKeysPossessed = keysPossessed.indexOf(toKey) === -1 ? (keysPossessed + toKey).split('').sort().join('') : keysPossessed;
      //     const newKey = `${toKey};${newKeysPossessed}`;
      //     // console.log(`- we can get there! (${newKey})`);
      //     results.set(newKey, cost)
      //   }
      // });
      return results;
    });

    const startNode = `${PairToKey(this.start)};`;
    const result = dij.pathToAny(startNode, (node) => {
      const keysPossessed = node.split(';')[1]??'';
      //console.log(` is at end?? ${node} ${keysPossessed.length} vs ${this.keys.size}`);
      return (keysPossessed.length === this.keys.size)
    }, false);

    // console.log(`Paths:`)
    // console.log(result);

    let minCost = Infinity;
    for (let endPairKey of [...result.keys()]) {
      const paths = result.get(endPairKey);
      console.log(`endPairKey=${endPairKey}`);
      console.log(paths.map(path=>path.join(' / ')).map(line=>`-${line}`).join('\n'))
      for (let path of paths) {
        let cost = 0;
        let node = startNode;
        for (let i=1; i<path.length; i++) {
          const toKey = path[i];
          cost += nodeMapCache.get(node).get(toKey);
          node = toKey;
        }

        console.log(`Cost of route: ${cost}`)
        if (cost < minCost) {
          minCost = cost;
        }
      }
    }

    console.log(`Duplicate DIJ nodes: ${dupNode}`);
    console.log(`BFS time: ${bfsTimer}ms`);
    console.log(`Total time: ${Date.now()-start}ms`)
    this.result = minCost.toString();

    return false;
  }
}