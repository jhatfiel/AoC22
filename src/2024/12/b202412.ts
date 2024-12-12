import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairToKey } from '../../lib/gridParser.js';

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

        for (let x=0; x<this.gp.width; x++) {
            for (let y=0; y<this.gp.height; y++) {
                let pair = {x,y};
                let key = PairToKey(pair);
                if (keyToRegionNum.has(key)) continue;
                let regionNum = regions.length;
                let perimeterKeys = new Set<string>();

                // we found a new region - flood fill it
                let type = this.gp.grid[y][x];
                let frontier: Pair[] = [pair];
                let region = new Set<string>();

                while (frontier.length !== 0) {
                    let newFrontier: Pair[] = [];
                    for (let p of frontier) {
                        let k = PairToKey(p);
                        if (region.has(k)) continue;
                        region.add(k);
                        keyToRegionNum.set(k, regionNum);
                        [[0,-1,0],[0,1,2],[-1,0,3],[1,0,1]].forEach(([dx,dy,d]) => {
                            let [px, py] = [p.x+dx, p.y+dy];
                            let pp = {x:px, y:py};
                            if (this.gp.valid(pp) && this.gp.grid[pp.y][pp.x] === type) {
                                newFrontier.push(pp);
                            } else {
                                perimeterKeys.add(PairToKey(pp)+`:${d}`);
                            }
                        });
                    }

                    frontier = newFrontier;
                }

                regionPerimeter.push(perimeterKeys.size);
                regions.push([...region.keys()]);
            }
        }
        
        let totalFencePrice = 0;
        for (let i=0; i<regions.length; i++) {
            this.log(`Region[${i}] border = ${regionPerimeter[i]}: area=${regions[i].length} [${regions[i].join('/')}]`)
            totalFencePrice += regions[i].length * regionPerimeter[i];
        }

        if (!moreToDo) {
            this.result = totalFencePrice.toString();
        }
        return moreToDo;
    }
}