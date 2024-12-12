import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';

export class b202412 extends AoCPuzzle {
    gp: GridParser;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
    }

    _runStep(): boolean {
        let moreToDo = false;
        let keyToRegionNum = new Map<string, number>();
        let regions: string[][] = [];
        let regionPerimeter: number[] = [];
        let regionWalls: number[] = [];

        for (let x=0; x<this.gp.width; x++) {
            for (let y=0; y<this.gp.height; y++) {
                let pair = {x,y};
                let key = PairToKey(pair);
                if (keyToRegionNum.has(key)) continue;
                let regionNum = regions.length;
                // [0] is up, [1] is right, [2] is down, [3] is left
                let perimeterLocations: Set<string>[] = Array.from({length:4}, _=>new Set<string>());

                // we found a new region - flood fill it
                let type = this.gp.grid[y][x];
                let frontier: Pair[] = [pair];
                let region = new Set<string>();

                while (frontier.length !== 0) {
                    let newFrontier: Pair[] = [];
                    for (let frontierPair of frontier) {
                        let k = PairToKey(frontierPair);
                        if (region.has(k)) continue;
                        region.add(k);
                        keyToRegionNum.set(k, regionNum);
                        [[0,-1,0],[0,1,2],[-1,0,3],[1,0,1]].forEach(([dx,dy,d]) => {
                            let [px, py] = [frontierPair.x+dx, frontierPair.y+dy];
                            let pp = {x:px, y:py};
                            if (this.gp.valid(pp) && this.gp.grid[pp.y][pp.x] === type) {
                                newFrontier.push(pp);
                            } else {
                                perimeterLocations[d].add(PairToKey(pp));
                            }
                        });
                    }

                    frontier = newFrontier;
                }

                regionPerimeter.push(perimeterLocations.reduce((sum, pk)=>sum+pk.size, 0)); // add them all up, that's the number of walls

                //this.log(`${regionNum} ${type} ${x},${y}`);
                let walls = 0;
                for (let dir=0; dir<perimeterLocations.length; dir++) {
                    let sortedLocations = [...perimeterLocations[dir].keys()].map(PairFromKey).sort((a,b) =>{
                        let dx=a.x-b.x;
                        let dy=a.y-b.y;

                        // 1 & 3 are up/down, so we want to sort by x first, then y
                        if (dir%2) return dx===0?dy:dx;
                        else       return dy===0?dx:dy;
                    });
                    //this.log(`Dir: ${dir}, locations=${sortedLocations.map(p=>`${p.x},${p.y}`).join('/')}`);
                    let lastPair = sortedLocations[0];
                    for (let loc of sortedLocations.slice(1)) {
                        let p = loc;
                        if ((p.x === lastPair.x && p.y-lastPair.y === 1) ||
                            (p.y === lastPair.y && p.x-lastPair.x === 1)) {
                            // if this position differs from the last by 1, then this is part of the same "wall"
                        } else {
                            walls++;
                        }

                        lastPair = p;
                    }
                    walls++;
                }

                regionWalls.push(walls);
                regions.push([...region.keys()]);
            }
        }
        
        let totalFencePrice = 0;
        let totalWallPrice = 0;
        for (let i=0; i<regions.length; i++) {
            let pair = PairFromKey(regions[i][0]);
            let type = this.gp.grid[pair.y][pair.x];
            this.log(`Region[${i}] type=${type} border = ${regionPerimeter[i]}: walls: ${regionWalls[i]} area=${regions[i].length} [${regions[i].join('/')}]`)
            totalFencePrice += regions[i].length * regionPerimeter[i];
            totalWallPrice += regions[i].length * regionWalls[i];
        }
        if (!moreToDo) {
            this.log(`Total fence price: ${totalFencePrice}`);
            this.log(`Total wall price: ${totalWallPrice}`);
            this.result = totalWallPrice.toString();
        }
        return moreToDo;
    }
}