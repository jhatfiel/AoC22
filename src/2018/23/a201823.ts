import { AoCPuzzle } from '../../lib/AoCPuzzle';
import { PriorityHeap } from '../../lib/priorityHeap';

type Triple = { 
    x: number;
    y: number;
    z: number;
};

class Cube {
    // s is the size of the cube, and its coordinates go from
    // pos.x/y/z-s to pos.x/y/z+s so s=0 is a point
    // s must be a power of 3 so we can cut cubes into 27 pieces
    constructor(public pos: Triple, public pow3: number) {
        this.s = (pow3-1)/2;
    }

    intersect: Point[] = [];
    s: number;

    // cut the cube up into 27 sub-cubes so we can have a center & size and easily cut the resulting cubes into 27 sub-cubes
    divide(): Cube[] {
        let newPow3 = this.pow3/3;
        let result = [-newPow3, 0, newPow3]
            .flatMap(xd => [-newPow3, 0, newPow3]
                .flatMap(yd => [-newPow3, 0, newPow3]
                    .flatMap(zd => {
                        let c = new Cube({x: this.pos.x+xd, y: this.pos.y+yd, z: this.pos.z+zd}, newPow3);
                        // add any points that intersect this new cube into c's list
                        c.intersect = this.intersect.filter(p => c.doesPointIntersect(p));
                        return c;
                    })
                )
            );
        return result;
    }

    addIfIntersects(p: Point) {
        if (this.doesPointIntersect(p)) this.intersect.push(p);
    }

    doesPointIntersect(p: Point): boolean {
        let remainingR = Math.min(p.r, p.r + this.s - Math.abs(p.pos.z-this.pos.z));
        if (remainingR < 0) return false;
        remainingR = Math.min(remainingR, remainingR + this.s - Math.abs(p.pos.y - this.pos.y));
        if (remainingR < 0) return false;
        return remainingR + this.s - Math.abs(p.pos.x - this.pos.x) >= 0;
    }

    toString(): string {
        return `(${this.pos.x},${this.pos.y},${this.pos.z}) intersect=${this.intersect.length} P${this.pow3},S${this.s}`;
    }
}

class Point {
    static parse(line: string): Point {
        // pos=<0,0,0>, r=4
        let arr = line.split(/[=<,>]/);
        return new Point({x: Number(arr[2]), y: Number(arr[3]), z: Number(arr[4])}, Number(arr[7]));
    }

    constructor(public pos: Triple, public r: number) {};

    distanceTo(target: Triple|Point): number {
        let t: Triple; 
        if (target instanceof Point) t = target.pos;
        else t = target;
        return Math.abs(this.pos.x-t.x) + Math.abs(this.pos.y-t.y) + Math.abs(this.pos.z-t.z);
    }

    inRange(t: Triple|Point): boolean {
        return this.distanceTo(t) <= this.r;
    }

    toString(): string {
        return `(${this.pos.x},${this.pos.y},${this.pos.z}) R${this.r}`;
    }
}

export class a201823 extends AoCPuzzle {
    points: Point[];
    mostIntersects = 0;
    priorityQube = new PriorityHeap<Cube>(a201823.CubeOrder);

    static CubeOrder(a,b) {
        if (a.intersect.length !== b.intersect.length) return b.intersect.length >= a.intersect.length;
        if (a.s !== b.s) return b.s <= a.s;
        return Math.abs(b.pos.x)+Math.abs(b.pos.y)+Math.abs(b.pos.z) <= 
               Math.abs(a.pos.x)+Math.abs(a.pos.y)+Math.abs(a.pos.z);
    }

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.points = lines.map(line => Point.parse(line));
        //this.points.forEach(p => this.log(p.toString()));

        let maxRP: Point;
        let maxR = 0;
        this.points.forEach(p => {
            if (p.r > maxR) {
                maxR = p.r;
                maxRP = p;
            }
        })
        this.log(`Part 1: pCount for ${maxRP.toString()} = ${this.points.filter(t => maxRP.inRange(t)).length}`);

        let boundMin = {x: Infinity, y: Infinity, z: Infinity};
        let boundMax = {x: -Infinity, y: -Infinity, z: -Infinity};
        this.points.forEach(p => {
            boundMin.x = Math.min(boundMin.x, p.pos.x-p.r);
            boundMin.y = Math.min(boundMin.y, p.pos.y-p.r);
            boundMin.z = Math.min(boundMin.z, p.pos.z-p.r);
            boundMax.x = Math.max(boundMax.x, p.pos.x+p.r);
            boundMax.y = Math.max(boundMax.y, p.pos.y+p.r);
            boundMax.z = Math.max(boundMax.z, p.pos.z+p.r);
        })
        this.log(`Min bound: ${JSON.stringify(boundMin)}`);
        this.log(`Max bound: ${JSON.stringify(boundMax)}`);
        let maxWidth = Math.max(boundMax.x-boundMin.x, Math.max(boundMax.y-boundMin.y, boundMax.z-boundMin.z));
        let exp = Math.ceil(Math.log(maxWidth)/Math.log(3));
        let pow3 = Math.pow(3, exp);
        this.log(`Nearest power 3 width: ${maxWidth} = 3^${exp} = ${pow3}`);

        let cube = new Cube({x: boundMin.x+Math.floor((boundMax.x-boundMin.x)/2), y: boundMin.y+Math.floor((boundMax.y-boundMin.y)/2), z: boundMin.z+Math.floor((boundMax.z-boundMin.z)/2)}, pow3)
        cube.intersect = [...this.points];
        this.log(`Bounding cube: ${cube.toString()}`);
        this.priorityQube.enqueue(cube);
    }

    _runStep(): boolean {
        let cube = this.priorityQube.dequeue();
        this.log(`Refine step: ${this.stepNumber}, priorityQube.size=${this.priorityQube.size()}, cube=${cube.toString()}`);
        if (cube.s >= 1) {
            cube.divide().forEach(c => {
                //this.log(`Divided: ${c}`);
                if (c.s === 0) {
                    // just check intersect counts on all of these
                    if (c.intersect.length > this.mostIntersects) {
                        this.mostIntersects = c.intersect.length;
                        this.log(`Found new max: ${c.toString()}`);
                        this.result = new Point({x:0,y:0,z:0},0).distanceTo(c.pos).toString();
                        // clear out all of the priorityQube that is lower priority than the current cube we found
                        this.priorityQube.truncate(this.priorityQube.enqueue(c));
                    }
                } else {
                    if (c.intersect.length > this.mostIntersects) this.priorityQube.enqueue(c)
                }
            });
        }
        let moreToDo = this.priorityQube.size() > 0;
        return moreToDo;
    }
}