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
        return new Rectangle({ x: center_.x - range, y: center_.y - range, z: center_.z - range },
                             { x: center_.x - range, y: center_.y - range, z: center_.z - range });
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
        for (let x=this.minPos.x; x<=this.maxPos.x; x++) {
            for (let y=this.minPos.y; y<=this.maxPos.y; y++) {
                for (let z=this.minPos.z; z<=this.maxPos.z; z++) {
                    result.push({x,y,z}); // converted coordinates
                }
            }
        }
        return result.map(c => {
            return {
                x:(((c.z+c.y)/2)+((c.x+((c.z-c.y)/2))/2))/2,
                y:(((c.z+c.y)/2)-((c.x+((c.z-c.y)/2))/2))/2,
                z:(c.x-((c.z-c.y)/2))/2,
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
        r.originalPoints().forEach(p => {
            this.log(`${JSON.stringify(p)}`)
        })

        this.result = 'Result';
        return moreToDo;
    }
}
