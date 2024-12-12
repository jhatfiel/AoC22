import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairToKey } from '../../lib/gridParser.js';

export class a202412 extends AoCPuzzle {
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
                let perimeter = 0;

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
                        let neighbors = this.gp.gridOrthogonalP(p);
                        // add 4-#neighbors - that's the exterior perimeter
                        perimeter += (4-neighbors.length);
                        for (let [n] of neighbors) {
                            // if it's not the right type, it's a perimeter
                            if (this.gp.grid[n.y][n.x] !== type) perimeter++;
                            else {
                                newFrontier.push(n);
                            }
                        }
                    }

                    frontier = newFrontier;
                }

                regionPerimeter.push(perimeter);
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