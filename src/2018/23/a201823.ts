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
    constructor(public pos: Triple, public pow3: number) {
        this.s = (Math.pow(3, pow3)-1)/2;
    }

    intersect: Point[] = [];
    s: number;

    // cut the cube up into 27 pieces
    divide(): Cube[] {
        let offset = Math.pow(3, this.pow3-1);
        let result = [-offset, 0, offset]
            .flatMap(xd => [-offset, 0, offset]
                .flatMap(yd => [-offset, 0, offset]
                    .flatMap(zd => {
                        let c = new Cube({x: this.pos.x+xd, y: this.pos.y+yd, z: this.pos.z+zd}, this.pow3-1);
                        // add any points that intersect this new cube into c's list
                        return c;
                    })
                )
            );
        return result;
    }

    toString(): string {
        return `(${this.pos.x},${this.pos.y},${this.pos.z}) P${this.pow3},S${this.s}`;
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
    priorityQube = new PriorityHeap<Cube>((a,b) => {
        if (a.intersect.length !== b.intersect.length) return a.intersect.length >= b.intersect.length;
        if (a.s !== b.s) return b.s <= a.s;
        return Math.abs(b.pos.x)+Math.abs(b.pos.y)+Math.abs(b.pos.z) <= 
               Math.abs(a.pos.x)+Math.abs(a.pos.y)+Math.abs(a.pos.z);
    })

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
        let pow3 = Math.ceil(Math.log(maxWidth)/Math.log(3));
        this.log(`Nearest power 3 width: ${maxWidth} = 3^${pow3} = ${Math.pow(3,pow3)}`);

        let cube = new Cube({x: boundMin.x+Math.floor((boundMax.x-boundMin.x)/2), y: boundMin.y+Math.floor((boundMax.y-boundMin.y)/2), z: boundMin.z+Math.floor((boundMax.z-boundMin.z)/2)}, pow3)
        this.log(`Bounding cube: ${cube.toString()}`);
        this.log(`Divided center: ${cube.divide()[13].toString()}`);
        this.priorityQube.enqueue(cube);

        /*
        cube = new Cube({x: 0, y: 0, z: 0}, 1);
        this.log(`Bounding cube: ${cube.toString()}`);
        this.log(`Divided TL: ${cube.divide()[0].toString()}`);
        this.log(`Divided center: ${cube.divide()[13].toString()}`);
        */

        //cube.divide().forEach(c => this.log(`  - ${c.toString()}`))
    }

    _runStep(): boolean {

        //this.log(`_runStep(): arr size = ${this.workingPoints.length}`);
            //this.log(`    ${p.toString()} ${this.workingPoints.filter(t => p.inRange(t)).length}`);

        let cube = this.priorityQube.dequeue();
        this.log(`Refine step: ${this.stepNumber}, priorityQube.size=${this.priorityQube.size()}, cube=${cube.toString()}`);
        let moreToDo = this.stepNumber <= 100 && cube.s > 0;
        if (cube.s >= 1) {
            cube.divide().forEach(c => {
                //this.log(`Divided: ${c}`);
                this.priorityQube.enqueue(c)
            });
        }

        // Part 2, we need to consider x +/- 1million, y +/- 1m, z +/- 1m.... that doesn't seem feasible.
        // because of local minimums, we can't just start moving to best coverage, right?
        // Do we need to consider the entire sample space?
        // Min bound: {"x":-132,801,852,"y":-107,405,829,"z":-64,320,623}
        // Max bound: {"x":251,036,687,"y":108,818,836,"z":193,733,559}
        // maybe we can bound?  From part 1, we know the point with the highest range has 613 other points in range.
        // So we know the best point will be in range of over half of the points.
        // no, that's not true - we know that half of the points are in range of the best point, but that doesn't mean they are all in range.
        // degenerate case, best point has radius 50, 10 other points have radius 0 and are in that region,
        // but then outside that radius 50 region, there are 3 points that all overlap.
        // DOH.

        // however, maybe we just need to figure out something about the input data that is special...
        // if a region is overlapped-by >1/2 of the data, that region MUST contain our answer

        if (!moreToDo) {
            //                                                79618206 too low
            // 671 {"x":87062187,"y":6033095,"z":38202643} = 131297925 too high
            // 673 {"x":87062187,"y":6033095,"z":39899997} = 132995279 (also too high) but bestCount could still be 673...
            // 686 {"x":87062187,"y":6033095,"z":52391450} = 145486732
        }

        this.result = 'Working....';
        return moreToDo;
    }
}