import { AoCPuzzle } from '../../lib/AoCPuzzle';

type Coord = { 
    x: number;
    y: number;
    z: number;
    t: number;
};

class Point {
    static parse(line: string): Point {
        // pos=<0,0,0>, r=4
        let arr = line.replace(' ', '').split(',');
        return new Point({x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2]), t: Number(arr[3])});
    }

    constructor(public pos: Coord) {};

    distanceTo(target: Coord|Point): number {
        let t: Coord; 
        if (target instanceof Point) t = target.pos;
        else t = target;
        return Math.abs(this.pos.x-t.x) + Math.abs(this.pos.y-t.y) + Math.abs(this.pos.z-t.z) + Math.abs(this.pos.t - t.t);
    }

    toString(): string {
        return `(${this.pos.x},${this.pos.y},${this.pos.z})`;
    }
}

export class a201825 extends AoCPuzzle {
    constellations: Point[][] = [];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.constellations = lines.map(line => [Point.parse(line)]);
    }

    _runStep(): boolean {
        let moreToDo = false;

        //this.log(`Step: ${this.stepNumber}`);

        OUTER: for (let i=0; i<this.constellations.length; i++) {
            let ci = this.constellations[i]
            for (let j=i+1; j<this.constellations.length; j++) {
                // compare all points from i & j, if any are within 3, join the constellation groups
                let cj = this.constellations[j];
                if (ci.some(cip => cj.some(cjp => cjp.distanceTo(cip) <= 3))) {
                    //this.log(`We can join ${i} and ${j}`);
                    ci.push(...this.constellations.splice(j, 1)[0]);
                    moreToDo = true;
                    break OUTER;
                }
            }
        }

        this.result = this.constellations.length.toString();
        return moreToDo;
    }
}