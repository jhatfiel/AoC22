import { AoCPuzzle } from '../../lib/AoCPuzzle';

type Triple = { 
    x: number;
    y: number;
    z: number;
};

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
    workingPoints: Point[];
    mustOverlapPoints: Point[] = [];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.points = lines.map(line => Point.parse(line));
        this.workingPoints = this.points;
        this.points.forEach(p => this.log(p.toString()));
    }

    _runStep(): boolean {
        let moreToDo = false;

        let maxRP: Point;
        let maxR = 0;

        //this.log(`_runStep(): arr size = ${this.workingPoints.length}`);
        this.workingPoints.forEach(p => {
            //this.log(`    ${p.toString()} ${this.workingPoints.filter(t => p.inRange(t)).length}`);
            if (p.r > maxR) {
                maxR = p.r;
                maxRP = p;
            }
        })
        let newPoints = this.workingPoints.filter(t => maxRP.inRange(t) && maxRP !== t);
        if (this.workingPoints.length === this.points.length) {
            this.log(`Part 1: pCount for ${maxRP.toString()} = ${newPoints.length+1}`);
        }

        moreToDo = newPoints.length !== 0 && (newPoints.length+1)/this.workingPoints.length > .5;
        if (moreToDo) {
            this.mustOverlapPoints.push(maxRP);
        }

        this.log(`Refine step: ${this.stepNumber} = ${this.workingPoints.length} => ${newPoints.length} max was ${maxRP.toString()}`);
        this.workingPoints = newPoints;

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
            //this.log(`mustOverlapPoints = ${this.mustOverlapPoints.length}`);
            // the answer has to (?) be in range of all of the mustOverlapPoints.
            // So, starting from the smallest (?), find what's in range of everything
            let bestCount = 0;
            let bestPoints: Triple[] = [];
            let lowestDistance = Infinity;
            this.mustOverlapPoints = this.mustOverlapPoints.sort((a, b) => a.r - b.r);
            this.log(`Num mustOverlapPoints: ${this.mustOverlapPoints.length}`);
            this.mustOverlapPoints.forEach(p => {
                this.log(`${p.toString()}`);
            })
            let bop = this.mustOverlapPoints[0];

            // cut down bounds?
            // 012345678901234567890
            // ...<---#--->.. x=7, r=4 (valid=7-4 up to 7+4 or 3..11)
            // .<--#-->...... x=4, r=3 (valid=4-3 up to 4+3 or 1..7)
            // means final solution has to be:
            // ...<--->...... x=3..7
            let boundMin = {x: -Infinity, y: -Infinity, z: -Infinity};
            let boundMax = {x: Infinity, y: Infinity, z: Infinity};
            this.mustOverlapPoints.forEach(p => {
                boundMin.x = Math.max(boundMin.x, p.pos.x-p.r);
                boundMin.y = Math.max(boundMin.y, p.pos.y-p.r);
                boundMin.z = Math.max(boundMin.z, p.pos.z-p.r);
                boundMax.x = Math.min(boundMax.x, p.pos.x+p.r);
                boundMax.y = Math.min(boundMax.y, p.pos.y+p.r);
                boundMax.z = Math.min(boundMax.z, p.pos.z+p.r);
            })
            this.log(`Min bound: ${JSON.stringify(boundMin)}`);
            this.log(`Max bound: ${JSON.stringify(boundMax)}`);
            this.mustOverlapPoints.forEach(p => {
                if (boundMin.x > p.pos.x+p.r && boundMax.x < p.pos.x-p.r) {
                    this.log(`x outside bounds: ${p.toString()}`);
                }
                if (boundMin.y > p.pos.y+p.r && boundMax.y < p.pos.y-p.r) {
                    this.log(`y outside bounds: ${p.toString()}`);
                }
                if (boundMin.z > p.pos.z+p.r && boundMax.z < p.pos.z-p.r) {
                    this.log(`z outside bounds: ${p.toString()}`);
                }
            })
            // try overlapping all of the mustOverlapPoints together - because we know we need to make them all work.

            for (let xd=0; false && xd<=bop.r; xd++) {
                //this.log(`xd=${xd}`)
                for (let yd=0; yd<=(bop.r-Math.abs(xd)); yd++) {
                    //this.log(`yd=${xd}`)
                    for (let zd=0; zd<=(bop.r-Math.abs(xd)-Math.abs(yd)); zd++) {
                        //this.log(`zd=${xd}`)
                        let p1 = {x: bop.pos.x + xd, y: bop.pos.y + yd, z: bop.pos.z + zd};
                        let p2 = {x: bop.pos.x - xd, y: bop.pos.y - yd, z: bop.pos.z - zd};
                        let p1Valid = this.mustOverlapPoints.every(p => p.inRange(p1));
                        let p2Valid = this.mustOverlapPoints.every(p => p.inRange(p2));
                        //this.log(`p1=${JSON.stringify(p1)}=${p1Valid}`);
                        //this.log(`p2=${JSON.stringify(p2)}=${p2Valid}`);
                        let check: Triple[] = [];
                        if (p1Valid) check.push(p1);
                        if (p2Valid) check.push(p2);
                        check.forEach(point => {
                            let thisCount = this.points.filter(p => p.inRange(point)).length;
                            if (thisCount > bestCount) {
                                bestCount = thisCount;
                                lowestDistance = Infinity;
                            }

                            if (thisCount === bestCount) {
                                let distance = Math.abs(point.x)+Math.abs(point.y)+Math.abs(point.z)
                                if (distance < lowestDistance) {
                                    lowestDistance = distance;
                                    this.log(`Found best point (for now ${xd}/${bop.r}): ${thisCount} ${JSON.stringify(point)} = ${distance}`);
                                }
                            }
                        })
                    }
                }
            }

            //                                                79618206 too low
            // 671 {"x":87062187,"y":6033095,"z":38202643} = 131297925 too high
            // 673 {"x":87062187,"y":6033095,"z":39899997} = 132995279 (also too high) but bestCount could still be 673...
            // 686 {"x":87062187,"y":6033095,"z":52391450} = 145486732
            this.result = lowestDistance.toString();
        } else {
            this.result = newPoints.length.toString();
        }

        return moreToDo;
    }
}