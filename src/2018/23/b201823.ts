import { AoCPuzzle } from '../../lib/AoCPuzzle';

type Coord = {
    x: number;
    y: number;
    z: number;
}

class Rectangle {
    // create a axis-rotated rectangle that represents a diamond with center and range (taxicab distance)
    static create(center: Coord, range: number): Rectangle {
        let center_: Coord = {
            x: center.x - center.y + center.z,
            y: 2*center.x - center.z,
            z: 2*center.y + center.z
        }
        return new Rectangle({ x: center_.x - range, y: center_.y - 2*range, z: center_.z - 2*range },
                             { x: center_.x + range, y: center_.y + 2*range, z: center_.z + 2*range });
    }

    constructor(public minPos: Coord, public maxPos) {}

    toString(): string { return `(${this.minPos.x},${this.minPos.y},${this.minPos.z})-(${this.maxPos.x},${this.maxPos.y},${this.maxPos.z})`; }

    /**
     * Assumes rectangle rect intersects with this Rectangle
     * @param rect - rectangle that we KNOW intersects with this rectangle
     */
    intersect(rect: Rectangle): Rectangle {
        return new Rectangle({x: Math.max(rect.minPos.x, this.minPos.x), y: Math.max(rect.minPos.y, this.minPos.y), z: Math.max(rect.minPos.z, this.minPos.z)},
                             {x: Math.min(rect.maxPos.x, this.maxPos.x), y: Math.min(rect.maxPos.y, this.maxPos.y), z: Math.min(rect.maxPos.z, this.maxPos.z)}
        )
    }

    originalPoints(): Coord[] {
        let result: Coord[] = [];
        for (let x=this.minPos.x+2; x<=this.maxPos.x; x+=2) {
            for (let y=this.minPos.y; y<=this.maxPos.y; y+=4) {
                for (let z=this.minPos.z; z<=this.maxPos.z; z+=4) {
                    result.push({x,y,z}); // converted coordinates
                }
            }
        }
        return result.map(c => {
            return {
                x:(((c.y+c.z)/2)+((c.x+((c.y-c.z)/2))/2))/2,
                y:(((c.y+c.z)/2)-((c.x+((c.y-c.z)/2))/2))/2,
                z:(c.x-((c.y-c.z)/2))/2
            };
        });
    }
}

export class b201823 extends AoCPuzzle {
    sampleMode(): void { };

    _loadData(lines: string[]) { }

    _runStep(): boolean {
        let moreToDo = false;

        let r = Rectangle.create({x: 4, y: 5, z: 6}, 2);
        this.log(`Rectangle: ${r.toString()}`);
        this.log(`Rectangle: 2,5,6 = ${Rectangle.create({x: 2, y: 5, z: 6}, 0).toString()}`);
        this.log(`Rectangle: 6,5,6 = ${Rectangle.create({x: 6, y: 5, z: 6}, 0).toString()}`);
        this.log(`Rectangle: 4,3,6 = ${Rectangle.create({x: 4, y: 3, z: 6}, 0).toString()}`);
        this.log(`Rectangle: 4,7,6 = ${Rectangle.create({x: 4, y: 7, z: 6}, 0).toString()}`);
        this.log(`Rectangle: 4,5,4 = ${Rectangle.create({x: 4, y: 5, z: 4}, 0).toString()}`);
        this.log(`Rectangle: 4,5,8 = ${Rectangle.create({x: 4, y: 5, z: 8}, 0).toString()}`);
        r.originalPoints().forEach(p => {
            this.log(`${JSON.stringify(p)}`)
        })

        this.result = 'Result';
        return moreToDo;
    }
}
