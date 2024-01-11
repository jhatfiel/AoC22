import { createReadStream } from "fs";
import { createInterface } from "readline";

class Point {
    constructor(public x=0, public y=0) {};
    touching(p: Point) {
        if (Math.abs(this.x-p.x) > 1 || Math.abs(this.y-p.y) > 1) return false;
        return true;
    }
    moveTo(p: Point) {
        if (Math.abs(this.x-p.x) == 2 &&
            Math.abs(this.y-p.y) == 2) {
            this.x = (this.x+p.x)/2;
            this.y = (this.y+p.y)/2;
        }
        if (Math.abs(this.x-p.x) == 2) {
            this.x = (this.x+p.x)/2;
            this.y = p.y;
        }
        if (Math.abs(this.y-p.y) == 2) {
            this.y = (this.y+p.y)/2;
            this.x = p.x;
        }
    }
    up() { this.y++; }
    down() { this.y--; }
    left() { this.x--; }
    right() { this.x++; }

    toString() {
        return `(${this.x},${this.y})`;
    }
}

class C {
    constructor() { for (var i=0; i < 10; i++) this.knots[i] = new Point(); this.visited.add(new Point().toString()); };
    knots: Array<Point> = new Array();

    visited = new Set<String>();

    process(line: string) {
        console.log(`Process: ${line}`);
        var [dir, numStr] = line.split(' ');
        var num = Number(numStr);
        var func = this.knots[0].up;
        if (dir == 'D') func = this.knots[0].down;
        if (dir == 'L') func = this.knots[0].left;
        if (dir == 'R') func = this.knots[0].right;

        for (var i=0; i < num; i++) {
            func.bind(this.knots[0])();
            this.reconcileKnots();
            this.debug();
        }
    }

    reconcileKnots() {
        for (var i=1; i < 10; i++) {
            if (!this.knots[i-1].touching(this.knots[i])) {
                this.knots[i].moveTo(this.knots[i-1]);
                if (i==9) {
                    // only count the positions that the tail (knot 9) has been to
                    this.visited.add(this.knots[i].toString());
                }
            }
        }
    }

    getResult() {
        return this.visited.size;
    }

    debug() {
        console.log(`H=${this.knots[0]} 1=${this.knots[1]} 2=${this.knots[2]} 3=${this.knots[3]} 4=${this.knots[4]} 5=${this.knots[5]} 6=${this.knots[6]} 7=${this.knots[7]} 8=${this.knots[8]} 9=${this.knots[9]} visited=${this.visited.size}`);
    }
}

var c = new C();

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});
