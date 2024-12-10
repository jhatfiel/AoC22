import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairFromKey, PairToKey } from '../../lib/gridParser.js';

export class a202410 extends AoCPuzzle {
    gp: GridParser;
    score = 0;
    score2 = 0; 
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, []);
        
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.gp.width*this.gp.height;
        let x = (this.stepNumber-1)%this.gp.width;
        let y = Math.floor((this.stepNumber-1)/this.gp.width);
        if (this.gp.grid[y][x] === '0') {
            //this.log(`TRAILHEAD at ${x},${y}`);
            let frontier: Pair[] = [{x,y}];
            let level=0;

            while (frontier.length && level < 9) {
                let newFrontier: Pair[] = [];
                level++;
                for (let p of [...frontier]) {
                    //this.log(`p: ${x},${y} has ${this.gp.grid[p.y][p.x]}`);
                    for (let [neighbor] of this.gp.gridOrthogonalP(p)) {
                        if (this.gp.grid[neighbor.y][neighbor.x] === level.toString()) {
                            //this.log(`${level} at ${neighbor.x},${neighbor.y}`);
                            newFrontier.push(neighbor);
                        }
                    }
                }
                frontier = newFrontier;
            }

            //this.log(`Number of 9's: ${frontier.length}`);
            this.score2 += frontier.length;
            this.score += new Set(frontier.map(PairToKey)).size;
        }
        if (!moreToDo) {
            this.result = this.score.toString();
            this.log(`Part 2: ${this.score2}`);
        }
        return moreToDo;
    }
}