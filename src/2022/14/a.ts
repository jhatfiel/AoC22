import { createReadStream } from "fs";
import { createInterface } from "readline";

type P = { row: number, col: number };

class C {
    constructor() {
        for (let i=0; i<200; i++) {
            this.grid.push(new Array(600).fill('.'));
        }

        this.grid[0][500] = '+';
    }

    grid = new Array<Array<string>>();
    left = 500;
    right = 500;
    height = 1;
    origin = 500;
    sandCount = 0;
    curSand = this.toP(1, 500);

    process(line: string) {
        const wallPoints = line.split(' -> ');
        let lastPoint = this.fromKey(wallPoints[0]);
        this.grid[lastPoint.row][lastPoint.col] = '#';
        this.adjustBounds(lastPoint);
        for (let ind=1; ind<wallPoints.length; ind++) {
            let nextPoint = this.fromKey(wallPoints[ind]);
            if (nextPoint.row == lastPoint.row) for (let x=Math.min(lastPoint.col, nextPoint.col); x<=Math.max(lastPoint.col, nextPoint.col); x++) this.grid[lastPoint.row][x] = '#';
            else                                for (let x=Math.min(lastPoint.row, nextPoint.row); x<=Math.max(lastPoint.row, nextPoint.row); x++) this.grid[x][lastPoint.col] = '#';

            this.adjustBounds(nextPoint);
            lastPoint = nextPoint;
        }
    }

    adjustBounds(p: P) {
        this.left   = Math.min(p.col, this.left);
        this.right  = Math.max(p.col, this.right);
        this.height = Math.max(p.row, this.height);
    }

    dropSand(waitTime: number) {
        let cameToRest = false;
        // keep track of the sand block
        this.curSand.row = 1; this.curSand.col = 500;

        this.grid[this.curSand.row][this.curSand.col] = '█';
        while (this.falling(waitTime) && this.curSand.row <= this.height+1) {
            this.debug();
        }
        if (this.curSand.row <= this.height) {
            cameToRest = true;
            this.sandCount++;
        }

        return cameToRest;
    }

    // this takes a surprisingly long time.
    // Maybe it would be better to keep track of the path the last piece of sand took and backtrack it until we make a different decision
    // oh, the slowness was just becasue of the debug/screen printing above
    falling(waitTime: number) {
        let didFall = false;
        let [oldRow, oldCol] = this.toArr(this.curSand);
        let [newRow, newCol] = [0, 0];
        if (this.grid[oldRow+1][oldCol] === '.') {
            didFall = true;
            newRow = oldRow+1; newCol = oldCol;
        } else if (this.grid[oldRow+1][oldCol-1] === '.') {
            didFall = true;
            newRow = oldRow+1; newCol = oldCol-1;
        } else if (this.grid[oldRow+1][oldCol+1] === '.') {
            didFall = true;
            newRow = oldRow+1; newCol = oldCol+1;
        }

        if (didFall) {
            this.grid[oldRow][oldCol] = '.';
            this.grid[newRow][newCol] = '█';
            this.curSand.row = newRow;
            this.curSand.col = newCol;
        }

        if (waitTime) { let waitTill = new Date(new Date().getTime() + waitTime); while (waitTill > new Date()) {}; }

        return didFall;
    }

    getResult() {
        return this.sandCount;
    }

    debug(clear=true) {
        if (clear) process.stdout.moveCursor(0, -1*(3+this.height));
        console.log(`------------------ ${this.sandCount} ${this.left} ${this.right} ${this.height}`);
        for (let row=0; row<=this.height+1; row++) {
            console.log(this.grid[row].slice(this.left-1, this.right+2).join(''));
        }
    }

    toKey(p: P) { return p.row+','+p.col; }
    toP(row: number, col: number): P { return { row: row, col: col}; }
    toArr(p: P) { return [p.row, p.col]; }
    fromKey(key: string) { const arr = key.split(','); return {row: Number(arr[1]), col: Number(arr[0])}; }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    c.debug(false);
    while (c.dropSand(100)) {
        c.debug(true);
    }
    console.log(`Result: ${c.getResult()}`);
});