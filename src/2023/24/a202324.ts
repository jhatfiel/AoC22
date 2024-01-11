import { AoCPuzzle } from "../../lib/AoCPuzzle";

export class a202324 extends AoCPuzzle {
    xMin = 200000000000000;
    yMin = 200000000000000;
    xMax = 400000000000000;
    yMax = 400000000000000;

    constructor(fn: string) { 
        super();
        if (fn && fn.startsWith('sample')) {
            this.xMin = 7; this.yMin = 7;
            this.xMax = 27; this.yMax = 27;
        }
    }

    points = new Array<Point>();

    loadData(lines: string[]) {
        lines.forEach(line => {
            let arr = line.replace(/ +/g, '').split(/[@,]/).map(Number);
            this.points.push({x: arr[0], y: arr[1], z: arr[2], xv: arr[3], yv: arr[4], zv: arr[5]});
        });
    }

    _runStep(): boolean {
        let cnt = 0;
        this.points.forEach((p1, ind) => {
            this.points.slice(ind).forEach(p2 => {
                let [t1, t2, cp] = this.getCollisionTime(p1, p2);
                if (t1 > 0 && t2 > 0 && cp.x >= this.xMin && cp.x <= this.xMax && cp.y >= this.yMin && cp.y <= this.yMax) {
                    //console.debug(`Compare ${JSON.stringify(p1)} and ${JSON.stringify(p2)}: Colission at ${cp.x}, ${cp.y}, ${time}`);
                    cnt++;
                }
            })
        })

        this.result = cnt.toString();
        return false;
    }

    getCollisionTime(p1: Point, p2: Point): [number, number, Point] {
        let m1 = p1.yv/p1.xv;
        let m2 = p2.yv/p2.xv;
        let b1 = p1.y - m1*p1.x;
        let b2 = p2.y - m2*p2.x;

        let cx = (b2-b1)/(m1-m2);

        let cy = m1*cx + b1;
        let t1 = (cx-p1.x)/p1.xv;
        let t2 = (cx-p2.x)/p2.xv;
        //console.debug(`at ${t}: ${cx}, ${cy}`);

        return [t1, t2, {x: cx, y: cy, z: 0, xv: 0, yv: 0, zv: 0}];
    }
}

type Point = {
    x: number;
    y: number;
    z: number;
    xv: number;
    yv: number;
    zv: number;
}