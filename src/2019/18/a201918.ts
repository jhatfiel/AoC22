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

    /*
    This could be improved substantially
    We could do the dijkstra first, and BFS underneath that instead of doing a bunch of BFS's up front
    as long as we cache all results based on what keys you have.  Never go through locked doors. Always stop at the first key you find down any path.
    */

    // find distance between pairs of keys, based on what other keys are necessary (what doors you'd have to go through)
    // then, find the best path between all keys, choosing the shortest path based on what keys you've picked up so far
    const graph = new Map<string, Map<string, {cost: number, keys: string[]}>>();
    console.log(this.gp.grid.map(row=>row.map(ch=>ch==='.'?' ':ch).join('')).join('\n'));
    const bfs = new BFS((state) => {
      // console.log(`BFS ${state}`)
      const pair = PairFromKey(state.at);
      const result = new Map<string, number>();
        this.gp.gridOrthogonalP(pair).forEach(([n]) => {
        if (this.gp.grid[n.y][n.x] !== '#') result.set(PairToKey(n), 1);
      })
      return result;
    });
    const keyNames = [...this.keys.keys()];

    // build the high-level graph
    ['@', ...keyNames].forEach((keyFrom, ind, arr) => {
      const fromPair = this.keys.get(keyFrom) ?? this.start;
      const fromPairKey = PairToKey(fromPair);
      console.log(`Processing Key: ${keyFrom} at ${fromPairKey} ${ind+1}/${arr.length}`);
      let nodeMap = graph.get(keyFrom);
      if (nodeMap === undefined) {
        nodeMap = new Map<string, {cost: number, keys: string[]}>();
        graph.set(keyFrom, nodeMap);
      }
      // analyze how we would get from this pair to other pairs that have keys
      keyNames.forEach((keyTo) => {
        if (keyTo <= keyFrom) return;
        const toPairKey = PairToKey(this.keys.get(keyTo));
        const paths = bfs.getPathsBetweenNodes(fromPairKey, toPairKey, true);
        //console.log(`paths between ${fromPairKey} and ${toPairKey}`)
        //console.log(paths.map(state=>state.toString()).join(' / '));
        paths.forEach(({cost, visited}) => {
          const keys: string[] = [];
          visited.forEach(posKey => {
            const pos = PairFromKey(posKey);
            const ch = this.gp.grid[pos.y][pos.x];
            if (this.doors.has(ch)) keys.push(ch.toLowerCase());
          })
          nodeMap.set(keyTo, {cost, keys});
          if (keyFrom !== '@') {
            let oppositeMap = graph.get(keyTo);
            if (oppositeMap === undefined) {
              oppositeMap = new Map<string, {cost: number, keys: string[]}>();
              graph.set(keyTo, oppositeMap);
            }
            oppositeMap.set(keyFrom, {cost, keys});
          }
        })
      });
    });

    // ['@', ...keyNames].forEach((keyFrom) => {
    //   const fromPair = this.keys.get(keyFrom) ?? this.start;
    //   const fromPairKey = PairToKey(fromPair);
    //   console.log(`Key: ${keyFrom} is at ${fromPairKey}`);
    //   const nodeMap = graph.get(fromPairKey);
    //   if (!nodeMap) return;
    //   [...nodeMap.entries()].forEach(([toPairKey, {cost, keys}]) => {
    //     console.log(`- to ${toPairKey} cost=${cost}, keysNeeded=${keys}`)
    //   });
    // });

    // now that we have a high-level graph, it's a "simple" dijkstra over it
    const dij = new Dijkstra((node) => {
      // console.log(`DIJ processing ${node}`)
      const results = new Map<string, number>();
      const [atKey, keysPossessed] = node.split(';');
      const nodeMap = graph.get(atKey);
      [...nodeMap.entries()].forEach(([toKey, {cost, keys}]) => {
        // console.log(`- to ${toKey} cost=${cost}, keysNeeded=${keys}`)
        if (keysPossessed.indexOf(toKey) === -1 && keys.every(k => keysPossessed.indexOf(k) !== -1)) {
          const newKey = `${toKey};${[toKey, ...keysPossessed.split('')].sort().join('')}`;
          // console.log(`- we can get there! (${newKey})`);
          results.set(newKey, cost)
        }
      });
      return results;
    });

    const result = dij.pathToAny(`@;`, (node) => {
      const keysPossessed = node.split(';')[1];
      // console.log(`? is at end ${node} ${keysPossessed.length} vs ${this.keys.size}`);
      return (keysPossessed.length === this.keys.size)
    }, false);
    console.log(`Paths:`)
    console.log(result);
    let minCost = Infinity;
    for (let endPairKey of [...result.keys()]) {
      const paths = result.get(endPairKey);
      console.log(`endPairKey=${endPairKey}`);
      console.log(paths.map(path=>path.join(' / ')).map(line=>`-${line}`).join('\n'))
      for (let path of paths) {
        let cost = 0;
        let node = '@';
        for (let i=1; i<path.length; i++) {
          const toKey = path[i].split(';')[0];
          cost += graph.get(node).get(toKey).cost;
          node = toKey;
        }

        console.log(`Cost of route: ${cost}`)
        if (cost < minCost) {
          minCost = cost;
        }
      }
    }

    this.result = minCost.toString();

    return false;
  }

  _runStepTooLong(): boolean {
    const bfs = new BFS((state) => {
      const {pair, keys} = fromState(state.at);
      const result = new Map<string, number>();
      this.gp.gridOrthogonalP(pair).forEach(([n]) => {
        const ch = this.gp.grid[n.y][n.x];
        const isSpace = ch === '.';
        const isWall = ch === '#';
        const isKey = this.keys.has(ch);
        if (!isWall && (isSpace || isKey || (keys.includes(ch.toLowerCase())))) {
          let newState: string;
          if (isKey && !keys.includes(ch)) {
            //console.log(`new key: ${keys},${ch}`)
            newState = toState(n, keys + ch); // we've picked up a new key!
          } else {
            newState = toState(n, keys);
          }
          result.set(newState, 1);
        }
      })
      return result;
    }, (state) => {
      const keys = state.at.split(';')[1];
      return keys.length === this.keys.size;
    });

    console.log(this.gp.grid.map(row=>row.join('')).join('\n'));
    console.log(`Start at ${PairToKey(this.start)}`);
    console.log(`Keys:`, this.keys);
    console.log(`Doors:`, this.doors);
    const paths = bfs.getPathsFrom(toState(this.start, ''), (state) => {
      // stop as soon as we have all the keys
      const keys = state.at.split(';')[1];
      return keys.length === this.keys.size;
    });
    console.log(`Possible paths:`);
    console.log(paths.join('\n'));

    this.result = paths[0].cost.toString();

    return false;
  }
}