import DRange from "drange";
import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { LineEquation } from "../../lib/geometry";

type Sensor = {
    x: number;
    y: number;
    size: number;
}

export class a202215 extends AoCPuzzle {
    loi=2000000;
    part2Bounds=4000000;
    drangeSize = 10000000;
    drange = new DRange(-this.drangeSize, this.drangeSize);
    sensors: Sensor[] = [];

    sampleMode(): void {
        this.loi = 10;
        this.part2Bounds = 20;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length-1;
        let line = this.lines[this.stepNumber];
        if (line) {
            this.process(this.lines[this.stepNumber]);
        }

        if (!moreToDo) {
            let numNoBeaconLocations = 2*this.drangeSize - this.drange.length;
            this.log(`Part 1: ${numNoBeaconLocations}`);
            this.result = numNoBeaconLocations.toString();
            let c = new a202215(this.fn, this.log);

            // find part 2
            let lineEq: LineEquation;
            let b1: number = undefined;
            let b2: number = undefined;
            for (let i=0; i<this.sensors.length; i++) {
                let s = this.sensors[i];
                // see if the two sensors come right to each others edges
                let match = this.sensors.filter(s2 => Math.abs(s2.x-s.x)+Math.abs(s2.y-s.y) === s2.size+s.size);
                if (match.length > 0) {
                    let s2 = match[0];
                    // s intersects with s2, so we have a line defined
                    let xd = s2.x-s.x;
                    let yd = s2.y-s.y;
                    // line is from top or bottom of diamond to right or left of diamond, based on which direction the sensors are from each other
                    let line = LineEquation.FromPoints({x: s.x, y: s.y + s.size*Math.sign(yd)}, {x: s.x + s.size*Math.sign(xd), y: s.y});
                    if (lineEq === undefined) lineEq = line;
                    if (lineEq.m !== line.m) {
                        // intersect
                        this.log(`Line1: ${lineEq.toString()}`);
                        this.log(`Line2: ${line.toString()}`);
                        let point = lineEq.intersection(line);
                        this.log(`Intersect: ${JSON.stringify(point)}`);
                        this.result = (point.x*4000000 + point.y).toString();
                        break;
                    }
                }
            };
            /*
            x=2895970
            y=2601918
            11583882601918
            SLOW
            for (let i=0; i<this.part2Bounds; i++) {
                c.drange = new DRange(-this.drangeSize, this.drangeSize);
                c.loi = i;
                this.lines.forEach(line => c.process(line));
                let len = c.drange.intersect(0, this.part2Bounds).length;
                if (len > 0) {
                    this.result = (c.drange.numbers()[0]*4000000 + i).toString();
                    break;
                }
            }
            */
        }
        return moreToDo;
    }

    process(line: string) {
        const arr = line.split(/[ :,=]/);
        const [sx, sy, bx, by] = [arr[3], arr[6], arr[13], arr[16]].map(Number);
        const distance = Math.abs(sx-bx) + Math.abs(sy-by);
        let width = distance - Math.abs(sy-this.loi);
        this.sensors.push({x: sx, y: sy, size: distance+1});

        if (by === this.loi) this.drange.subtract(bx);
        if (width >= 0) {
            this.drange.subtract(sx-width, sx+width);
        }
    }
}