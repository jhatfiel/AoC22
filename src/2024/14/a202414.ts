import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair } from '../../lib/gridParser.js';

export class a202414 extends AoCPuzzle {
    w=101;
    h=103;
    halfw = (this.w-1)/2;
    halfh = (this.h-1)/2;
    numSteps = 100;

    finalLocations = new Map<string, number>();

    sampleMode(): void {
        this.w=11;
        this.h=7;
        this.halfw = (this.w-1)/2;
        this.halfh = (this.h-1)/2;
    };

    _loadData(lines: string[]) {}

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let line = this.lines[this.stepNumber-1];
        let arr = [...line.matchAll(/(-?[\d]+)/g)].map(m=>m[1]).map(Number);
        let loc = {x: arr[0], y: arr[1]};
        let vel = {x: arr[2], y: arr[3]};

        let x = ((loc.x + this.numSteps*vel.x)%this.w + this.w)%this.w;
        let y = ((loc.y + this.numSteps*vel.y)%this.h + this.h)%this.h;
        let key = `${x},${y}`;
        this.finalLocations.set(key, (this.finalLocations.get(key)??0) + 1);
        //this.log(`Bot ${this.stepNumber} ends at ${key}`);

        if (!moreToDo) {
            let qScores: number[] = [0,0,0,0];
            for (let x=0; x<this.w; x++) {
                for (let y=0; y<this.h; y++) {
                    let count = this.finalLocations.get(`${x},${y}`);
                    if (!count) continue;
                    let q: number = undefined;
                    if (x < this.halfw && y < this.halfh) q = 0;
                    if (x > this.halfw && y < this.halfh) q = 1;
                    if (x < this.halfw && y > this.halfh) q = 2;
                    if (x > this.halfw && y > this.halfh) q = 3;
                    //this.log(`Position: ${x},${y} = ${count}, q=${q}`);
                    if (q !== undefined) qScores[q] += count;
                }
            }
            this.log(qScores);
            this.result = qScores.reduce((product, qScore)=>product*qScore,1).toString();
        }
        return moreToDo;
    }
}