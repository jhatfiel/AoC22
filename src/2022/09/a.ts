import fs from 'fs';
import readline from 'readline';

class Point {
    constructor(public x=0, public y=0) {};
    touching(p: Point) {
        if (Math.abs(this.x-p.x) > 1 || Math.abs(this.y-p.y) > 1) return false;
        return true;
    }
    moveTo(p: Point) {
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
    constructor() { this.visited.add(new Point().toString()); };
    head = new Point();
    tail = new Point();

    visited = new Set<String>();

    process(line: string) {
        var [dir, numStr] = line.split(' ');
        var num = Number(numStr);
        var func = this.head.up;
        if (dir == 'D') func = this.head.down;
        if (dir == 'L') func = this.head.left;
        if (dir == 'R') func = this.head.right;

        for (var i=0; i < num; i++) {
            func.bind(this.head)();
            this.reconcileTail();
            //this.debug();
        }
    }

    reconcileTail() {
        if (!this.head.touching(this.tail)) {
            this.tail.moveTo(this.head);
            this.visited.add(this.tail.toString());
        }
    }

    getResult() {
        return this.visited.size;
    }

    debug() {
        console.log(`H=${this.head} T=${this.tail} visited=${this.visited.size}`);
    }
}

var c = new C();

var fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});
