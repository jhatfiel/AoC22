export type Point = { x: number, y: number };

export class LineEquation {
    m: number;
    b: number;

    static FromPoints(p1: Point, p2: Point): LineEquation {
        let result = new LineEquation();
        let xd = p2.x-p1.x;
        let yd = p2.y-p1.y;
        result.m = yd/xd;
        result.b = p1.y - result.m * p1.x;

        return result;
    }

    intersection(line: LineEquation): Point {
        // y=m1x+b1
        // y=m2x+b2
        // m1x + b1 = m2x + b2
        // x = (b2 - b1)/(m1 - m2)
        // y = m1*x + b1
        let x = (line.b - this.b) / (this.m - line.m);
        let y = this.m * x + this.b;
        return {x,y};
    }

    toString(): string {
        return `y = ${this.m} * x + ${this.b}`;
    }
}